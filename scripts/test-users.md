# In Sequence — Test & Demo Accounts

**Password for all accounts:** `TestPass123!`

---

## Test Users

| Email | Password | Name | Description |
|---|---|---|---|
| `test-fresh@insequence.co` | `TestPass123!` | Fresh Tester | Active subscription, no assessment. Tests empty states and onboarding prompts. |
| `test-assessed@insequence.co` | `TestPass123!` | Assessed Tester | Completed assessment + roadmap. No deals, inventory, or bookmarks. |
| `test-maker@insequence.co` | `TestPass123!` | Jordan Rivera | **Filmmaker** — Stage 3, platform_builder archetype. 2 deals (green equity + yellow licensing), 6 inventory assets, deal verdict. |
| `test-service@insequence.co` | `TestPass123!` | Priya Sharma | **Product Designer** — Stage 2, high_earner_no_ownership archetype. 2 deals (yellow service + red advisory), 5 inventory assets. |
| `test-performer@insequence.co` | `TestPass123!` | Marcus Cole | **Musician** — Stage 3, untapped_catalog archetype. 3 deals (green licensing + yellow catalog sale + red brand), 7 inventory assets, AI analysis, deal verdict. |
| `test-lapsed@insequence.co` | `TestPass123!` | Lapsed Tester | Canceled/expired subscription. Tests paywall and gating behavior. |
| `test-admin@insequence.co` | `TestPass123!` | Admin Tester | Admin role. Tests admin dashboard and member management. |

## Demo Users

| Email | Password | Name | Description |
|---|---|---|---|
| `demo-sales@insequence.co` | `TestPass123!` | Maya Chen | Polished Stage 2 brand strategist. Assessment, roadmap, inventory, and a renegotiated deal. Use for sales demos. |
| `demo-onboard@insequence.co` | `TestPass123!` | Demo User | Clean slate — active subscription, nothing else. Use for live onboarding walkthroughs. |

---

## Reset to Clean State

Run this command from the project root to delete all test users and re-create them with fresh data:

```
node --experimental-strip-types scripts/seed-test-users.ts --reset
```

Other commands:
- `--delete` — delete all test users without re-seeding
- (no flag) — seed users (skips any that already exist)
