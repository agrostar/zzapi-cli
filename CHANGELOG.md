# Change Log

## [2.0.0]
- Using v1.4.0 of zzapi, which adds `$tests` key to the assertion operators to run tests recursively on a sub-object
- Output formatting changed: Indents the results for assertions under `$tests`

## [1.1.1]
- Using v1.2.1 of zzapi, which fixes the stopOnFailure bug

## [1.1.0]
- Using v1.2.0 of zzapi, which adds the following
  - Support for `$sw`, `$ew`, `$co` (startsWith, endsWith, contains) comparisons
  - Support for non-equal comparisons for array/string `$size`
  - Option for stopping further tests when status test fails

## [1.0.0]
- Initial release