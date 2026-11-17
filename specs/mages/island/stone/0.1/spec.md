---
slug: mages/island/stone
version: "0.1"
title: Island — Stone
summary: A walker presents the stone proof of a Drake Island walk (the quests in order and the stone laid at the threshold, each with its revealed preimage) and the verifier answers with the five checks, re-derived from nothing but hashes.
status: draft
targetFrameworkVersion: "0.6.0"
category: provenance
keywords:
  - agentprivacy
  - drake-island
  - stone-proof
  - stars
  - hash-chain
  - evidence
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Walker (mark)
    requirement: REQUIRED
    member: issuer
    identifierScope: pairwise
  - role: Verifier (a Mages City keeper, or the site)
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  request: OPTIONAL
  response: RECOMMENDED
  rationale: >-
    Before joining, the walker has no DID and no key a verifier recognises; the
    stone proof is self-verifying by hash commitments (every leaf, link and the
    root re-derive), and an envelope signature by a key unknown to the verifier
    would add nothing. After joining through the Star Key, the member's VTA
    signs the presentation (the site's signer is the mldsa65-ed25519
    composite), which is what binds the walk to the member rather than to
    whoever holds a copy. The verifier's determination is RECOMMENDED to be
    signed because a keeper may keep it as the record of a sign-up.
issuedAtRequirement:
  requirement: RECOMMENDED
  rationale: >-
    The presentation changes nothing at the verifier, so it is not
    consequential; issuedAt lets a keeper place a presentation in time against
    the walk's own star times, and the framework baseline is enough.
sideEffects:
  level: none
  rationale: >-
    Verification only: the verifier re-derives hashes, optionally reads the
    shared chain, and returns a determination. What a keeper does with a passed
    walk (a sign-up, a membership) is a separate act under its own task.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests the walker's mark and island stars with their preimages: which
    stations were walked, under which walk archetype, and when. Discloses the
    check results and the stations found, back to the walker who sent them.
retention:
  class: exchange
  rationale: >-
    The verifier needs the proof only while it checks it. A keeper that admits
    the walker keeps what its own admission record needs, under the task that
    makes that record; this task asks for nothing to be kept.
errorCodes: []
related:
  - mages/constellation/commit
  - mages/presence/thumb
  - mages/moon/seal
---

## Abstract

Drake Island is a walk of quests on agentprivacy.ai, ending at a **threshold**
where the walker lays a **stone**. Each quest walked and the stone itself are
stars: records held in the walker's browser, whose leaves may have been
committed to the shared chain
([`constellation/commit`](../../../constellation/commit/0.1/spec.md)).

**Island — Stone** is the presentation of that walk as evidence. The walker sends
a **stone proof**: their mark, their island stars in order, each with the
preimage of its leaf, and the root those stars fold to. The verifier (a Mages
City keeper reading what a walker brings to sign-up, or the site itself)
re-derives everything from hashes and answers with the result of five checks.
It proves that the device behind this mark walked these quests, in this order,
at these times, and, where the chain is consulted, that the site saw them then.
It does not prove who the walker is. That is what joining adds.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace (`https://tasks.mages.city/spec/mages/`) as part of the **mages** family; this is the agentprivacy.ai profile of it. The payload is the stone
proof kind `agentprivacy/island-stone/1` as the site builds it today, and the
response is the result its reference verifier returns. A later stone proof will
carry the island Trust Task documents themselves in place of v1 preimages. The
schema **MAY** change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the walker's browser) **MUST**:

1. Emit a *Trust Task document* whose `type` is `https://tasks.mages.city/spec/mages/island/stone/0.1`, with `issuer` set to the mark (before joining, equal to `payload.mark`) and `recipient` set to the verifier.
2. Include every `island/quest` and `island/stone` star whose preimage it kept, in chain order, ending with the stone, and only those: the walker's other stars are not part of the proof.
3. Carry each star's preimage exactly as it was hashed, as a string; a re-serialized preimage will not re-derive.

A conforming **consumer** (the verifier) **MUST** perform the checks below and
return their results in a `#response`. A proof that fails a check is a
successful verification with a negative result (`ok: false`), not an error:
`trust-task-error` is reserved for a document the verifier could not evaluate.

### Verification

0. **Shape.** `kind` is `agentprivacy/island-stone/1`, `mark` is 64 lowercase hex, and `stars` is non-empty. The payload schema enforces this; a failure is `malformedRequest`.
1. **Every leaf re-derives from what it reveals.** For each star, `sha256(pre) == leaf`, and the parsed preimage's `type` and `at` equal the star's `type` and `recordedAt` (the site's v1 preimage names the instant `at`; the document names it `recordedAt`).
2. **Every star re-derives from its leaf, its mark and its place on the chain.** For each star, `sha256(prev + "|" + leaf + "|" + mark + "|" + seq) == hash`. The walker's other stars sit between these on their own chain and are not in the proof, so `prev` is checked only as part of its own star's hash, never against the previous island star; the root (4) binds the set and the witness (5) the times.
3. **The stars are in the order they were made**, strictly rising in `seq`; and **it ends in a stone laid at the threshold**: the last star is `island/stone` and every star before it is `island/quest`.
4. **The root re-derives.** Folding `root = sha256(root + "|" + hash)` from 64 zeros over the stars in order gives `payload.root`.
5. **Witness** (OPTIONAL, where `chain` is given or the verifier knows the chain). The shared chain's `GET /evidence?mark=` lists the same leaves under the same mark. The result reports how many of the proof's stars the chain has seen; the check passes only when it has seen all of them.

The determination is `ok` when every check performed passed. The reference
verifier also returns the station numbers found in the preimages, in order.
It does not check that the stone's station is the threshold station or that the
stations form a walk the island's quest graph allows; a verifier **MAY** check
both, and a verifier that does reports them as further steps.

## Definitions

- **Mark**, **leaf**, **moon**, **intent** — see the family [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md). A star is the leaf of an intent.
- **Island star** — a star of type `island/quest` (a quest station walked) or `island/stone` (the stone laid at the threshold). Its preimage (leaf v1) is `JSON.stringify({type, content: {station, archetype}, at})`, kept on the device when the star is made so that it can later be revealed.
- **Stone proof** — the object `{kind, mark, root, stars, chain?}` of kind `agentprivacy/island-stone/1`.
- **Link** — a star's `hash`, `sha256(prev + "|" + leaf + "|" + mark + "|" + seq)`, where `prev` is the hash of the star before it on the walker's own chain.

## Request

A walker who walked stations 1 and 7 as the Swordsman and laid the stone at
station 13 presents the walk to a Mages City keeper. Every value below
re-derives.

```json
{
  "id": "urn:uuid:4d8e2b17-93c5-4a6f-b0e1-7f25c9a3d846",
  "type": "https://tasks.mages.city/spec/mages/island/stone/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "issuedAt": "2026-11-16T11:00:00Z",
  "payload": {
    "kind": "agentprivacy/island-stone/1",
    "mark": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
    "root": "557f39c8cff26853df61fe275f2380d6aa5aabd560ce0413a09bb1078ef45c72",
    "stars": [
      {
        "seq": 3,
        "type": "island/quest",
        "recordedAt": "2026-11-10T09:00:00.000Z",
        "leaf": "925a5c49463bd923249ba2fe44f6f836389a2b54c12663e53851e21a62b59fca",
        "prev": "bc1cfcbf8a517aa3b5ae8449e8f98baf0dde69ec51d170acd7879e571f08649a",
        "hash": "a62b4f4bc1a7ca39e9f2a438ee077a48eb53a78b149879bf7f90d5c37dea67f5",
        "moon": "moon-2026-11-09",
        "pre": "{\"type\":\"island/quest\",\"content\":{\"station\":1,\"archetype\":\"swordsman\"},\"at\":\"2026-11-10T09:00:00.000Z\"}"
      },
      {
        "seq": 5,
        "type": "island/quest",
        "recordedAt": "2026-11-11T09:30:00.000Z",
        "leaf": "0371309f9806d10d1014eadd900b2919018a9df6ed56fd94399bc14f44cda63c",
        "prev": "e60efcee53c03c57bc9e97fc2fb72cd2f5c1ff751018d9436da2f8cd87fc42a4",
        "hash": "cf72a9ac5d1ebc2976b7424ac20adfd686ec246b8baf96430eb063ebdb86c39c",
        "moon": "moon-2026-11-09",
        "pre": "{\"type\":\"island/quest\",\"content\":{\"station\":7,\"archetype\":\"swordsman\"},\"at\":\"2026-11-11T09:30:00.000Z\"}"
      },
      {
        "seq": 9,
        "type": "island/stone",
        "recordedAt": "2026-11-12T18:00:00.000Z",
        "leaf": "bb4551849d8fa8fcb4ab459a69b34e962266994ba6aa33e3ca8945ca85d947cd",
        "prev": "4af1d0b50ed2405e93561f34c22ff1714fb487fbd7a66de9a7ec43b80ec99757",
        "hash": "80b01931f5ff7279e7a787d0258f44ff8770d8a3d251c0981a9cba70a2776710",
        "moon": "moon-2026-11-09",
        "pre": "{\"type\":\"island/stone\",\"content\":{\"station\":13,\"archetype\":\"swordsman\"},\"at\":\"2026-11-12T18:00:00.000Z\"}"
      }
    ]
  }
}
```

## Response

The verifier answers with a document whose `type` is the request's *Type URI*
with `#response`, conforming to `$defs.Response` in
[`payload.schema.json`](payload.schema.json): `ok`, one entry per check in
`steps`, the stations found in `quests`, and `witnessed` where the chain was
consulted. Here the keeper did not consult the chain, so step 5 is absent.

```json
{
  "id": "urn:uuid:a1c7e5f3-0b2d-4e98-86a4-d3f0b7c2e519",
  "type": "https://tasks.mages.city/spec/mages/island/stone/0.1#response",
  "threadId": "urn:uuid:4d8e2b17-93c5-4a6f-b0e1-7f25c9a3d846",
  "issuer": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-16T11:00:02Z",
  "payload": {
    "ok": true,
    "steps": [
      { "name": "every leaf re-derives from what it reveals", "ok": true },
      { "name": "every star re-derives from its leaf, its mark and its place on the chain", "ok": true },
      { "name": "the stars are in the order they were made", "ok": true },
      { "name": "it ends in a stone laid at the threshold", "ok": true },
      { "name": "the root re-derives", "ok": true }
    ],
    "quests": [1, 7, 13]
  }
}
```

## Security & Privacy

### Data carried

The proof reveals, for each island star, the station, the walk archetype and
the time it was made, together with the mark and the hashes that bind them. That
is the walker's choice of what to show: the site keeps a preimage only for
island stars, whose content is fine to reveal, and never for notes, records or
proverbs. A producer **MUST NOT** add any other star to a stone proof. The
response carries check names, an optional short note per check, and station
numbers: nothing the walker did not send.

### Correlation

The mark is pairwise to agentprivacy.ai, but presenting a stone proof to a
keeper shows that mark to a second party, and the mark is public on the shared
chain: the keeper can then read every constellation the mark ever committed.
Presenting is therefore a choice to be known to the City by that record, and a
walker who does not want that should not present.
The verifier's identifier scope is `public` because the walker must know which
community it is showing the walk to; a pairwise identifier for a keeper would hide exactly the fact the
walker needs. Times are millisecond-exact and, with the station numbers, form a
small activity profile.

**A copy is as good as the original.** Before joining nothing binds the
presenter to the mark: anyone holding a copy of a stone proof can present it,
and the five checks pass. The proof establishes that a walk happened, not that
the presenter made it. A keeper who needs the second fact asks for the walk
after joining, signed by the member's VTA.

### Retention

The verifier needs the proof only while checking it, and keeps nothing under
this task. A keeper that admits a walker on the strength of it keeps what that
admission requires, under the task that admits; the stone proof itself can be
asked for again.

### Consent/purpose

The walker presents the walk to be recognised for it, typically when signing up
to Mages City. The verifier uses the proof to decide what the walk shows and for
nothing else: not to profile the walker's other stars, which the proof does not
contain, and not to share the preimages onward.
