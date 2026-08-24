export const YKS_STORAGE_KEYS={
  primary:"yks",
  lastGood:"yks_last_good",
  lastGoodAt:"yks_last_good_at",
  automaticBackups:"yks_yedek",
  conflictBackups:"yks_conflict_backups",
  errorLog:"yks_error_log",
  stateHash:"yks_state_hash",
  schema:"yks_schema",
  cloudLastSync:"yks_last_sync_at",
  cloudBaseRevision:"yks_cloud_base_rev",
  cloudDirty:"yks_cloud_dirty",
  deviceId:"yks_device_id",
  focusRuntime:"yks_focus_runtime_v1",
  moreUsage:"yks_more_usage_v3",
  legacyMirrorHash:"yks_v4_mirror_hash",
  legacyMirrorUpdatedAt:"yks_v4_mirror_updated_at"
} as const;

export type YksStorageKey=(typeof YKS_STORAGE_KEYS)[keyof typeof YKS_STORAGE_KEYS];
export const YKS_STORAGE_KEY_LIST=Object.freeze(Object.values(YKS_STORAGE_KEYS));
