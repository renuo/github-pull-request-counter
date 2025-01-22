# Test Updates Required

## html-generator.test.js

### DOM Structure Tests ✓
1. `has the correct title text` ✓
   - Fixed: Now uses querySelector('.title') and checks both tag type and textContent
   - Updated: Tests h5 element and correct text content

2. `has the correct link` ✓
   - Fixed: Now uses querySelector('.pr-link')
   - Updated: Tests href, target, and textContent

3. `has the correct subdescription` ✓
   - Fixed: Now checks all components of GitHub-style format
   - Updated: Tests repo name, PR number, author, and time format

4. `adds less-relevant-group class to title and containers` ✓
   - Fixed: Now uses classList.contains() for more robust testing
   - Updated: Tests all relevant elements for class presence

### Integration Tests (integration.test.ts) ✓

1. `has the correct section titles` ✓
   - Fixed: Now uses textContent instead of innerHTML
   - Updated: Tests all section titles with correct text

2. `has the correct pull request links and metadata` ✓
   - Fixed: Now tests both links and metadata comprehensively
   - Added: Tests for PR number, author, and timestamps

3. `displays status badges for pull requests` ✓
   - Added: New test to verify status badge presence
   - Verifies: Badge count matches expected number of PRs

### New Features to Test

1. Status Badges
   - Add test for badge presence
   - Verify badge text content
   - Verify badge classes

2. Assignee Information
   - Add test for assignee presence
   - Verify assignee text format

3. Time Format
   - Add test for formatTimeAgo function
   - Verify "today", "yesterday", "X days ago", "X months ago"

## Test Update Strategy

1. Update DOM structure tests first
2. Add new feature tests
3. Update integration tests
4. Verify no regressions

## Files to Update
1. src/js/services/html-generator.test.js
2. __test__/integration/integration.test.ts
