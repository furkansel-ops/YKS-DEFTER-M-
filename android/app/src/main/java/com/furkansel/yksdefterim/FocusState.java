package com.furkansel.yksdefterim;

import java.util.LinkedHashMap;
import java.util.Map;

/** Platform-independent timer transitions; persisted by FocusNotificationsRuntime. */
final class FocusState {
    static final long MAX_REVISION = 9_007_199_254_740_991L;
    static final int MAX_SECONDS = 86_400;
    static final long MAX_ELAPSED = 604_800_000L;
    static final long MAX_RECORD_AGE = 48 * 60 * 60 * 1000L;
    static final long MAX_DATE = 8_640_000_000_000_000L;

    static final class Clock {
        final long wall, elapsed;
        final int boot;
        Clock(long wall, long elapsed, int boot) { this.wall = wall; this.elapsed = elapsed; this.boot = boot; }
    }

    static final class Snapshot {
        final String id, mode, state, subject, topic, task;
        final boolean isWork;
        final int total, left;
        final long endAt, startedAt, savedAt, elapsed;
        final double credited;

        private Snapshot(String id, String mode, String state, boolean isWork, int total, int left,
                long endAt, long startedAt, double credited, String subject, String topic, String task,
                long savedAt, long elapsed) {
            this.id = id; this.mode = mode; this.state = state; this.isWork = isWork;
            this.total = total; this.left = left; this.endAt = endAt; this.startedAt = startedAt;
            this.credited = credited; this.subject = subject; this.topic = topic; this.task = task;
            this.savedAt = savedAt; this.elapsed = elapsed;
        }

        boolean running() { return "running".equals(state); }
        boolean stopwatch() { return "sw".equals(mode); }
        boolean expired() { return !stopwatch() && left <= 0; }

        static Snapshot parse(Map<String, Object> data) {
            if (data == null || number(data.get("version"), 1, 1) != 1
                    || !(data.get("id") instanceof String)
                    || !((String) data.get("id")).matches("[A-Za-z0-9][A-Za-z0-9._:-]{0,127}")
                    || !(data.get("isWork") instanceof Boolean)) throw invalid();
            String mode = data.containsKey("mode") ? String.valueOf(data.get("mode")) : "pomo";
            String state = String.valueOf(data.get("state"));
            if (!("pomo".equals(mode) || "sw".equals(mode))
                    || !("paused".equals(state) || "running".equals(state))) throw invalid();
            int total = (int) Math.round(number(data.get("total"), 1, MAX_SECONDS));
            int left = (int) Math.round(number(data.get("left"), 0, MAX_SECONDS));
            long endAt = (long) number(data.get("endAt"), 0, MAX_DATE);
            long startedAt = (long) number(data.get("startedAt"), 0, MAX_DATE);
            long savedAt = (long) number(data.get("savedAt"), 0, MAX_DATE);
            double credited = number(data.get("credited"), 0, MAX_ELAPSED / 60_000);
            long elapsed = "sw".equals(mode) ? (long) number(data.get("elapsed"), 0, MAX_ELAPSED) : 0;
            if ("sw".equals(mode)) { total = MAX_SECONDS; left = 0; endAt = 0; }
            else {
                if (left > total || credited > total / 60.0 || ("running".equals(state) && endAt == 0)) throw invalid();
                if ("paused".equals(state)) endAt = 0;
            }
            return new Snapshot((String) data.get("id"), mode, state, (Boolean) data.get("isWork"),
                    total, left, endAt, startedAt, credited, text(data.get("subject"), 80),
                    text(data.get("topic"), 100), text(data.get("task"), 100), savedAt, elapsed);
        }

        Map<String, Object> data() {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("version", 1); data.put("id", id); data.put("mode", mode); data.put("state", state);
            data.put("isWork", isWork); data.put("total", total); data.put("left", left);
            data.put("endAt", endAt); data.put("startedAt", startedAt); data.put("credited", credited);
            data.put("subject", subject); data.put("topic", topic); data.put("task", task); data.put("savedAt", savedAt);
            if (stopwatch()) data.put("elapsed", elapsed);
            return data;
        }

        Snapshot at(long effectiveWall, long actualWall) {
            if (!running()) return this;
            if (stopwatch()) {
                long nextElapsed = Math.min(MAX_ELAPSED, elapsed + Math.max(0, effectiveWall - savedAt));
                return new Snapshot(id, mode, state, isWork, total, 0, 0, startedAt, credited,
                        subject, topic, task, actualWall, nextElapsed);
            }
            long remaining = Math.max(0, Math.min(total * 1000L, endAt - effectiveWall));
            int nextLeft = (int) ((remaining + 999) / 1000);
            return new Snapshot(id, mode, state, isWork, total, nextLeft, actualWall + remaining,
                    Math.max(0, actualWall - (total * 1000L - remaining)), credited,
                    subject, topic, task, actualWall, 0);
        }

        Snapshot change(boolean running, long now) {
            return new Snapshot(id, mode, running ? "running" : "paused", isWork, total, left,
                    !stopwatch() && running ? now + left * 1000L : 0,
                    stopwatch() ? startedAt : Math.max(0, now - (total - left) * 1000L),
                    credited, subject, topic, task, now, elapsed);
        }
    }

    static final class Record {
        final long revision;
        final Snapshot snapshot;
        final Clock anchor;
        final boolean enabled;
        final String dismissedId;
        Record(long revision, Snapshot snapshot, Clock anchor, boolean enabled, String dismissedId) {
            if (revision < 0 || revision > MAX_REVISION || anchor == null || anchor.wall < 0 || anchor.wall > MAX_DATE
                    || anchor.elapsed < 0 || anchor.boot < -1 || dismissedId == null || dismissedId.length() > 128)
                throw new IllegalArgumentException("invalid_stored_state");
            this.revision = revision; this.snapshot = snapshot; this.anchor = anchor;
            this.enabled = enabled; this.dismissedId = dismissedId;
        }
        static Record empty(Clock now) { return new Record(0, null, now, false, ""); }
        Snapshot current(Clock now) {
            if (snapshot == null) return null;
            // elapsedRealtime survives process death and wall-clock changes. After a
            // reboot use persisted wall time; never mistake a new boot for old uptime.
            long effective = anchor.boot >= 0 && now.boot == anchor.boot && now.elapsed >= anchor.elapsed
                    ? anchor.wall + (now.elapsed - anchor.elapsed) : now.wall;
            return snapshot.at(effective, now.wall);
        }
        boolean visible() { return enabled && snapshot != null && !snapshot.id.equals(dismissedId); }
    }

    static Record prune(Record before, Clock now) {
        long age = before.anchor.boot >= 0 && now.boot == before.anchor.boot && now.elapsed >= before.anchor.elapsed
                ? now.elapsed - before.anchor.elapsed : Math.max(0, now.wall - before.anchor.wall);
        if (before.snapshot == null || age <= MAX_RECORD_AGE) return before;
        // Match the page's abandoned-runtime boundary. Returning a fresh savedAt
        // for a week-old record could otherwise credit it to the day of reopening.
        return new Record(nextRevision(before), null, now, false, "");
    }

    static final class Result {
        final boolean ok;
        final Record record;
        Result(boolean ok, Record record) { this.ok = ok; this.record = record; }
    }

    static Result update(Record before, long expectedRevision, Snapshot snapshot, boolean enabled, boolean reveal, Clock now) {
        if (expectedRevision < 0 || expectedRevision > MAX_REVISION) throw new IllegalArgumentException("invalid_request");
        if (before.revision != expectedRevision) return new Result(false, before);
        String dismissed = snapshot == null || reveal ? "" : before.dismissedId;
        Snapshot current = snapshot == null ? null : snapshot.at(now.wall, now.wall);
        return new Result(true, new Record(nextRevision(before), current, now, enabled, dismissed));
    }

    static Record action(Record before, String id, long revision, String action, Clock now) {
        if (before.snapshot == null || !before.snapshot.id.equals(id) || before.revision != revision || !before.visible()) return before;
        Snapshot current = before.current(now);
        if ("dismiss".equals(action)) return new Record(before.revision, before.snapshot, before.anchor, before.enabled, id);
        if ("expire".equals(action) && current.running() && current.expired() && before.snapshot.left > 0)
            return new Record(nextRevision(before), current, now, before.enabled, before.dismissedId);
        if (current.expired() || !("pause".equals(action) && current.running()
                || "resume".equals(action) && !current.running())) return before;
        return new Record(nextRevision(before), current.change("resume".equals(action), now.wall), now, before.enabled, before.dismissedId);
    }

    static long revision(Object value) {
        if (!(value instanceof Number)) throw new IllegalArgumentException("invalid_request");
        double n = ((Number) value).doubleValue();
        if (!Double.isFinite(n) || n < 0 || n > MAX_REVISION || n != Math.floor(n)) throw new IllegalArgumentException("invalid_request");
        return (long) n;
    }
    private static long nextRevision(Record before) {
        if (before.revision >= MAX_REVISION) throw new IllegalArgumentException("revision_exhausted");
        return before.revision + 1;
    }
    private static double number(Object value, double min, double max) {
        if (!(value instanceof Number)) throw invalid();
        double n = ((Number) value).doubleValue();
        if (!Double.isFinite(n) || n < min || n > max) throw invalid();
        return n;
    }
    private static String text(Object value, int length) {
        if (!(value instanceof String)) throw invalid();
        String text = ((String) value).replaceAll("[\\x00-\\x1f\\x7f]", " ").trim();
        return text.substring(0, Math.min(text.length(), length));
    }
    private static IllegalArgumentException invalid() { return new IllegalArgumentException("invalid_snapshot"); }
}
