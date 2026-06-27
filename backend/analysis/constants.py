import builtins
 
TRACKED_BUILTINS: frozenset[str] = frozenset(builtins.__dict__.keys())
 