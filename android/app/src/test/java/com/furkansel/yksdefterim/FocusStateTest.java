package com.furkansel.yksdefterim;

import static org.junit.Assert.*;
import java.util.HashMap;
import java.util.Map;
import org.junit.Test;

public class FocusStateTest {
    private static final long WALL = 1_760_000_000_000L;
    private static FocusState.Clock clock(long delta) { return new FocusState.Clock(WALL + delta, 100_000 + delta, 7); }
    private static Map<String, Object> data(String mode) {
        Map<String, Object> data = new HashMap<>();
        data.put("version", 1); data.put("id", "timer:1"); data.put("mode", mode); data.put("state", "running");
        data.put("isWork", true); data.put("total", 1500); data.put("left", 1500); data.put("endAt", WALL + 1_500_000);
        data.put("startedAt", WALL); data.put("savedAt", WALL); data.put("credited", 0);
        data.put("subject", "Türkçe"); data.put("topic", "Paragraf"); data.put("task", "task:1");
        if ("sw".equals(mode)) data.put("elapsed", 0);
        return data;
    }
    private static FocusState.Record start(String mode) {
        return FocusState.update(FocusState.Record.empty(clock(0)), 0,
                FocusState.Snapshot.parse(data(mode)), true, false, clock(0)).record;
    }
    private static void invalid(Map<String, Object> data) {
        try { FocusState.Snapshot.parse(data); fail("Expected invalid snapshot"); }
        catch (IllegalArgumentException expected) { assertEquals("invalid_snapshot", expected.getMessage()); }
    }

    @Test public void countdownPauseResumeExcludesLongPause() {
        FocusState.Record running = start("pomo");
        FocusState.Record paused = FocusState.action(running, "timer:1", 1, "pause", clock(65_000));
        assertEquals(2, paused.revision); assertEquals("paused", paused.snapshot.state);
        assertEquals(1435, paused.snapshot.left); assertEquals(0, paused.snapshot.endAt);
        assertEquals(1435, paused.current(clock(3_665_000)).left);
        FocusState.Record resumed = FocusState.action(paused, "timer:1", 2, "resume", clock(3_665_000));
        assertEquals(3, resumed.revision);
        assertEquals(WALL + 3_665_000 + 1_435_000, resumed.snapshot.endAt);
        assertEquals(1430, resumed.current(clock(3_670_000)).left);
        assertEquals(WALL + 3_600_000, resumed.snapshot.startedAt);
    }

    @Test public void stopwatchPauseResumeExcludesLongPause() {
        FocusState.Record paused = FocusState.action(start("sw"), "timer:1", 1, "pause", clock(65_250));
        assertEquals(65_250, paused.snapshot.elapsed);
        assertEquals(65_250, paused.current(clock(3_665_250)).elapsed);
        FocusState.Record resumed = FocusState.action(paused, "timer:1", 2, "resume", clock(3_665_250));
        assertEquals(70_250, resumed.current(clock(3_670_250)).elapsed);
    }

    @Test public void compareAndSwapRejectsPageStateOlderThanNativeAction() {
        FocusState.Record paused = FocusState.action(start("pomo"), "timer:1", 1, "pause", clock(65_000));
        FocusState.Result stale = FocusState.update(paused, 1, FocusState.Snapshot.parse(data("pomo")), true, false, clock(70_000));
        assertFalse(stale.ok); assertSame(paused, stale.record); assertEquals("paused", stale.record.snapshot.state);
    }

    @Test public void staleButtonsCannotToggleNewerRevisionOrDifferentSession() {
        FocusState.Record paused = FocusState.action(start("pomo"), "timer:1", 1, "pause", clock(1000));
        assertSame(paused, FocusState.action(paused, "timer:1", 1, "resume", clock(2000)));
        assertSame(paused, FocusState.action(paused, "timer:other", 2, "resume", clock(2000)));
        assertSame(paused, FocusState.action(paused, "timer:1", 2, "pause", clock(2000)));
        assertSame(paused, FocusState.action(paused, "timer:1", 2, "unexpected", clock(2000)));
    }

    @Test public void clearTombstonePreventsStalePageOrButtonResurrection() {
        FocusState.Record cleared = FocusState.update(start("pomo"), 1, null, false, false, clock(1000)).record;
        assertEquals(2, cleared.revision); assertNull(cleared.snapshot); assertFalse(cleared.visible());
        assertSame(cleared, FocusState.action(cleared, "timer:1", 1, "pause", clock(2000)));
        assertFalse(FocusState.update(cleared, 1, FocusState.Snapshot.parse(data("pomo")), true, false, clock(2000)).ok);
    }

    @Test public void processRestoreUsesPersistedMonotonicAnchor() {
        FocusState.Record before = start("sw");
        FocusState.Record restored = new FocusState.Record(before.revision,
                FocusState.Snapshot.parse(before.snapshot.data()),
                new FocusState.Clock(before.anchor.wall, before.anchor.elapsed, before.anchor.boot), before.enabled, before.dismissedId);
        assertEquals(3_600_000, restored.current(clock(3_600_000)).elapsed);
        FocusState.Record paused = FocusState.action(restored, "timer:1", 1, "pause", clock(3_600_000));
        assertEquals(3_600_000, paused.current(clock(7_200_000)).elapsed);
    }

    @Test public void wallClockJumpDoesNotAddOrRemoveActiveTimeWithinBoot() {
        FocusState.Clock clockJump = new FocusState.Clock(WALL + 86_400_000, 165_000, 7);
        FocusState.Snapshot sw = start("sw").current(clockJump);
        FocusState.Snapshot pomo = start("pomo").current(clockJump);
        assertEquals(65_000, sw.elapsed); assertEquals(1435, pomo.left);
        assertEquals(clockJump.wall + 1_435_000, pomo.endAt);
    }

    @Test public void rebootUsesWallFallbackRatherThanPreviousBootUptime() {
        FocusState.Clock reboot = new FocusState.Clock(WALL + 65_000, 500, 8);
        assertEquals(65_000, start("sw").current(reboot).elapsed);
        assertEquals(1435, start("pomo").current(reboot).left);
        FocusState.Record paused = FocusState.action(start("sw"), "timer:1", 1, "pause", clock(1000));
        assertEquals(1000, paused.current(reboot).elapsed);
    }

    @Test public void readDoesNotAccumulateOrRoundClockTimeTwice() {
        FocusState.Record running = start("pomo");
        assertEquals(1500, running.current(clock(250)).left);
        assertEquals(WALL + 1_500_000, running.current(clock(250)).endAt);
        assertEquals(1499, running.current(clock(1250)).left);
        assertEquals(1, running.revision);
        assertEquals(1500, running.snapshot.left);
    }

    @Test public void expiredCountdownCannotResumeOrPauseAndClampsAtZero() {
        FocusState.Record running = start("pomo");
        assertEquals(0, running.current(clock(2_000_000)).left);
        assertSame(running, FocusState.action(running, "timer:1", 1, "pause", clock(2_000_000)));
        assertSame(running, FocusState.action(running, "timer:1", 1, "resume", clock(2_000_000)));
    }

    @Test public void expiryAdvancesRevisionOnceForImmediatePageReconciliation() {
        FocusState.Record running = start("pomo");
        assertSame(running, FocusState.action(running, "timer:1", 1, "expire", clock(1000)));
        FocusState.Record expired = FocusState.action(running, "timer:1", 1, "expire", clock(1_500_000));
        assertEquals(2, expired.revision); assertEquals(0, expired.snapshot.left);
        assertSame(expired, FocusState.action(expired, "timer:1", 2, "expire", clock(1_600_000)));
    }

    @Test public void userDismissalSurvivesAutoSyncAndPermissionToggle() {
        FocusState.Record dismissed = FocusState.action(start("pomo"), "timer:1", 1, "dismiss", clock(1000));
        assertFalse(dismissed.visible());
        FocusState.Record synced = FocusState.update(dismissed, 1, dismissed.current(clock(2000)), true, false, clock(2000)).record;
        assertFalse(synced.visible());
        FocusState.Record disabled = FocusState.update(synced, 2, synced.current(clock(3000)), false, false, clock(3000)).record;
        FocusState.Record enabled = FocusState.update(disabled, 3, disabled.current(clock(4000)), true, false, clock(4000)).record;
        assertFalse(enabled.visible());
        FocusState.Record revealed = FocusState.update(enabled, 4, enabled.current(clock(5000)), true, true, clock(5000)).record;
        assertTrue(revealed.visible());
    }

    @Test public void newSessionCanShowAfterOldSessionWasDismissed() {
        FocusState.Record dismissed = FocusState.action(start("pomo"), "timer:1", 1, "dismiss", clock(1000));
        Map<String, Object> next = data("sw"); next.put("id", "timer:2");
        assertTrue(FocusState.update(dismissed, 1, FocusState.Snapshot.parse(next), true, false, clock(2000)).record.visible());
    }

    @Test public void validatesEveryNumericBoundaryAndWrongTypes() {
        for (String field : new String[] {"total", "left", "endAt", "startedAt", "savedAt", "credited", "elapsed"}) {
            Map<String, Object> next = data("sw"); next.put(field, -1); invalid(next);
            next = data("sw"); next.put(field, Double.NaN); invalid(next);
            next = data("sw"); next.put(field, "100"); invalid(next);
        }
        Map<String, Object> next = data("pomo"); next.put("left", 1501); invalid(next);
        next = data("pomo"); next.put("credited", 26); invalid(next);
        next = data("pomo"); next.put("endAt", 0); invalid(next);
        next = data("pomo"); next.put("total", 86_401); invalid(next);
        next = data("sw"); next.put("elapsed", 604_800_001L); invalid(next);
        next = data("pomo"); next.put("savedAt", FocusState.MAX_DATE + 1); invalid(next);
    }

    @Test public void validatesIdentityFlagsAndSanitizesLabels() {
        for (String field : new String[] {"id", "mode", "state", "isWork", "subject", "topic", "task", "version"}) {
            Map<String, Object> next = data("pomo"); next.put(field, null); invalid(next);
        }
        Map<String, Object> next = data("pomo"); next.put("id", "bad/id"); invalid(next);
        next = data("pomo"); next.put("subject", "  Türkçe\nParagraf\u0000  ");
        assertEquals("Türkçe Paragraf", FocusState.Snapshot.parse(next).subject);
        next.put("topic", new String(new char[150]).replace('\0', 'x'));
        assertEquals(100, FocusState.Snapshot.parse(next).topic.length());
    }

    @Test public void supports24HourPomodoroAndSevenDayStopwatch() {
        Map<String, Object> next = data("pomo");
        next.put("total", 86_400); next.put("left", 86_400); next.put("endAt", WALL + 86_400_000);
        FocusState.Record record = FocusState.update(FocusState.Record.empty(clock(0)), 0,
                FocusState.Snapshot.parse(next), true, false, clock(0)).record;
        assertEquals(86_335, record.current(clock(65_000)).left);
        assertEquals(FocusState.MAX_ELAPSED, start("sw").current(clock(FocusState.MAX_ELAPSED + 10_000)).elapsed);
    }

    @Test public void creditedMinutesSurviveActionAndNeverIncludePausedDuration() {
        Map<String, Object> next = data("pomo"); next.put("credited", 1);
        FocusState.Record running = FocusState.update(FocusState.Record.empty(clock(0)), 0,
                FocusState.Snapshot.parse(next), true, false, clock(0)).record;
        FocusState.Record paused = FocusState.action(running, "timer:1", 1, "pause", clock(125_000));
        FocusState.Record resumed = FocusState.action(paused, "timer:1", 2, "resume", clock(3_725_000));
        assertEquals(1, resumed.snapshot.credited, 0);
        assertEquals(125, resumed.snapshot.total - resumed.snapshot.left);
    }

    @Test public void revisionExhaustionDoesNotWrapAndSafeIntegerOnly() {
        FocusState.Record exhausted = new FocusState.Record(FocusState.MAX_REVISION, start("pomo").snapshot, clock(0), true, "");
        try { FocusState.update(exhausted, FocusState.MAX_REVISION, null, false, false, clock(0)); fail(); }
        catch (IllegalArgumentException expected) { assertEquals("revision_exhausted", expected.getMessage()); }
        for (Object value : new Object[] {-1, 1.5, "1", Double.POSITIVE_INFINITY, FocusState.MAX_REVISION + 1}) {
            try { FocusState.revision(value); fail(); } catch (IllegalArgumentException expected) { /* rejected */ }
        }
    }

    @Test public void abandonedRecordsBecomeTombstonesInsteadOfCreditingAWeekLater() {
        for (String mode : new String[] {"pomo", "sw"}) {
            FocusState.Record running = start(mode);
            assertSame(running, FocusState.prune(running, clock(FocusState.MAX_RECORD_AGE)));
            FocusState.Record expired = FocusState.prune(running, clock(7 * 86_400_000L));
            assertNull(expired.snapshot); assertFalse(expired.visible()); assertEquals(2, expired.revision);
            assertSame(expired, FocusState.action(expired, "timer:1", 1, "resume", clock(7 * 86_400_000L)));
            assertFalse(FocusState.update(expired, 1, running.snapshot, true, false, clock(7 * 86_400_000L)).ok);
            assertSame(expired, FocusState.prune(expired, clock(8 * 86_400_000L)));
            FocusState.Record paused = FocusState.action(running, "timer:1", 1, "pause", clock(1000));
            assertNull(FocusState.prune(paused, clock(7 * 86_400_000L)).snapshot);
        }
    }

    @Test public void abandonedRecordAgeUsesMonotonicTimeAndSurvivesRebootFallback() {
        FocusState.Record running = start("pomo");
        assertSame(running, FocusState.prune(running, new FocusState.Clock(WALL + 7 * 86_400_000L, 165_000, 7)));
        assertNull(FocusState.prune(running, new FocusState.Clock(WALL + 7 * 86_400_000L, 1000, 8)).snapshot);
        FocusState.Record refreshed = FocusState.update(running, 1, running.current(clock(86_400_000)), true, false, clock(86_400_000)).record;
        assertSame(refreshed, FocusState.prune(refreshed, clock(2 * 86_400_000L)));
    }
}
