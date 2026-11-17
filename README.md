# The mages family of Trust Tasks

What the members, visitors and services of Mages City ask of each other, written as private Trust Task
specifications ([SPEC §6.5](https://github.com/trustoverip/dtgwg-trust-tasks-tf/blob/main/SPEC.md#65-private-and-unpublished-trust-task-specifications))
under `https://tasks.mages.city/spec/mages/<slug>/<MAJOR.MINOR>`. Read them at **https://tasks.mages.city/**, where
every Type URI is its own address.

Drafts, version 0.1. Each describes something that already runs, in its own JSON shape; none is accepted in
document form yet. Each specification's page on tasks.mages.city says what runs today and where.

| path | what |
|---|---|
| `specs/mages/` | 14 tasks: at the guide (`presence/thumb`, `meet/open`, `meet/accept`, `meet/confirm`, `proverb/submit`, `voice/commit`, `voice/share`), stars and seasons (`constellation/commit`, `island/stone`, `moon/seal`), keys and artefacts (`city-key/present`, `artefact/present`), keeping the record (`contribution/dispose`, `scroll/seal`) |
| `specs/mages/_shared/0.1/CONVENTIONS.md` | marks, leaves, moons, **intents** (acts that never leave a device, and so are not tasks), and which identifiers in the examples are real |
| `ceremonies/mages/meet/0.1/` | the Meet Rite: two phones, two yeses, one edge |
| `survey/registry.json` | the public Trust Tasks registry (903 tasks at `0cdf9e517`) read for what a community like this one uses, should use instead of writing its own, overlaps, or leaves; shown at https://tasks.mages.city/registry/ |
| `survey/upstream_index.json` | the registry index that reading was made from (`tools/index_upstream.py`) |
| `tools/check.mjs` | validate the family with the task force's own `build-registry --validate-only` and `validate-ceremonies`, unchanged |

## Check

```bash
git clone https://github.com/trustoverip/dtgwg-trust-tasks-tf ../dtgwg-trust-tasks-tf
(cd ../dtgwg-trust-tasks-tf && npm ci --engine-strict=false)
node tools/check.mjs ../dtgwg-trust-tasks-tf
```

The check lends `specs/mages` and `ceremonies/mages` to the checkout under the registry's prefix, validates them
there, and takes them back. Nothing here is rewritten. Last run: 17 Nov 2026 at `0cdf9e517`, 1,421 specifications
and the ceremony valid, no findings on the family.

## Related

- Write your own community's family: [mages-trust-tasks-kit](https://github.com/mitchuski/mages-trust-tasks-kit).
- Formal models of two of this family's invariants, and of the public registry:
  [trust-tasks-formal](https://github.com/mitchuski/trust-tasks-formal) (`TrustTasks/Mages.lean`).
- Mages City, the community: `did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc`.

## Licence

Prose CC BY 4.0 (`LICENSE-TEXT.md`); schemas and tools Apache-2.0 (`LICENSE`).
