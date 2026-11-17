---
slug: mages/moon/seal
version: "0.1"
title: Moon — Seal
summary: When a moon closes, the chain keeper seals that moon's rows of the shared stars chain as a scroll (every row and the root they fold to) and sends it to Mages City, which re-derives the root before recording it.
status: draft
targetFrameworkVersion: "0.6.0"
category: provenance
keywords:
  - agentprivacy
  - stars
  - scroll
  - moon
  - hash-chain
  - mages-city
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Chain keeper
    requirement: REQUIRED
    member: issuer
    identifierScope: public
  - role: Mages City
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  request: RECOMMENDED
  response: RECOMMENDED
  rationale: >-
    The scroll is self-consistent by construction (every link and the root
    re-derive from the rows), but self-consistency is not authenticity: a scroll
    that never was on the chain can be made to re-derive. The City can close that
    gap by reading the chain's own GET /scroll over TLS, so a signature is not the
    only defence, and the chain keeper has no City-recognised key yet. Once the
    keeper signs (a VTA key, the mldsa65-ed25519 composite the site uses), this
    should rise to REQUIRED, because the City publishes the scroll and anchors
    its root for others to rely on (SPEC §4.7.2). The City's acknowledgement is
    the record that it accepted that root.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    Sealing is consequential: the City records and publishes the scroll, and a
    seal must be placeable after the moon it seals has ended.
sideEffects:
  level: mutating
  rationale: >-
    Mages City records the scroll, publishes it in the Scriptorium and anchors
    its root. A further seal of the same moon with the same root is absorbed; a
    different root for a moon already sealed is refused.
consequences:
  - The scroll is published by Mages City and its root anchored, readable by anyone.
  - Every mark that committed in the moon appears in the published scroll.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests every row of one moon of the public chain: marks, star types,
    leaves, link hashes, times and places. All of it was already public on the
    chain; the seal makes it permanent. Discloses the root the City re-derived.
retention:
  class: durable
  rationale: >-
    The scroll is the closed record of a season; the City keeps it so that any
    member's stars can be shown to have been on the chain in that moon, long
    after the chain itself is read for anything else.
maxDocumentBytes:
  request: 16777216
  rationale: >-
    A scroll carries every row of one moon, about 430 bytes of JSON each, so the
    framework ceiling of 16 MiB holds about 38,000 rows. A moon with more rows
    than that needs a chunked transfer this version does not define.
errorCodes:
  - code: mages/moon/seal:moonNotClosed
    meaning: The moon has not ended; only a closed moon can be sealed.
    retryable: true
  - code: mages/moon/seal:linkBroken
    meaning: A row does not re-derive (hash != sha256(prev | leaf | mark | seq)), or a row's prev is not the hash of the row before it, or the sequence numbers are not consecutive.
    retryable: false
  - code: mages/moon/seal:rootMismatch
    meaning: Folding the rows' hashes from 64 zeros does not give the scroll's root.
    retryable: false
  - code: mages/moon/seal:countMismatch
    meaning: The declared star or mark count does not match the rows.
    retryable: false
  - code: mages/moon/seal:alreadySealed
    meaning: This moon is already sealed with a different root.
    retryable: false
related:
  - mages/constellation/commit
  - mages/island/stone
  - mages/presence/thumb
---

## Abstract

The stars chain keeps seasons by the moon. While a moon is open, visitors commit
constellations to it ([`constellation/commit`](../../../constellation/commit/0.1/spec.md)).
When it closes, its rows are final, and **Moon — Seal** carries them to Mages
City as a **scroll**: every row of that moon, in chain order, and the root they
fold to. The City re-derives every link and the root before it records the
scroll, publishes it in the Scriptorium, and anchors the root.

The scroll is the stars Worker's `GET /scroll?moon=` output, unchanged, as a
payload. Anyone can check it the way the City does.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace (`https://tasks.mages.city/spec/mages/`) as part of the **mages** family; this is the agentprivacy.ai profile of it. Today the City's builder
reads `GET /scroll` directly; this document form is how the keeper will hand a
sealed moon over. The schema **MAY** change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the chain keeper) **MUST**:

1. Emit a *Trust Task document* whose `type` is `https://tasks.mages.city/spec/mages/moon/seal/0.1`, with `issuer` set to the chain keeper and `recipient` to Mages City.
2. Seal only a moon that has ended (`sealed: true`, `endsAt` in the past at `issuedAt`), and carry all of that moon's rows in chain order, unmodified.

A conforming **consumer** (Mages City) **MUST**, before recording the scroll:

1. Refuse a moon that has not ended (`moonNotClosed`, retryable once it has).
2. For every row, check `hash == sha256(prev + "|" + leaf + "|" + mark + "|" + seq)`; for every row after the first, check that `seq` is one more than the previous row's and that `prev` is the previous row's `hash` (`linkBroken`). A moon's rows are contiguous on the chain because commits append in time order and a commit is admitted only in the moon now open.
3. Fold `root = sha256(root + "|" + hash)` from 64 zeros over the rows and compare with `payload.root` (`rootMismatch`).
4. Check `stars` equals the number of rows and `marks` the number of distinct marks among them (`countMismatch`).
5. Refuse a seal for a moon already sealed with a different root (`alreadySealed`); a seal with the same root is absorbed and answered as the first was.

A consumer **SHOULD** also read the chain's own `GET /scroll?moon=` and compare
roots, which is what establishes that the rows were on the chain and not merely
consistent with one another. An empty moon seals with no rows and the root of 64
zeros.

### The fold rule

```
link(row) = sha256(prev + "|" + leaf + "|" + mark + "|" + seq)
root      = 64 zeros
for each row of the moon, in chain order:  root = sha256(root + "|" + row.hash)
```

## Authorization

The authority to seal is **custody of the chain**: the keeper is the operator of
the stars chain, and only it can attest that these were the chain's rows for the
moon. Before the keeper signs, the City does not take that attestation on trust;
it re-derives the scroll, and its own read of the chain over TLS is the evidence
of custody. A valid proof from the keeper identifies who sealed the scroll but
does not make a scroll correct: the City still re-derives every link and the
root, and a signed scroll that fails them is refused.

The City's authority to record and publish is its own, as the community that
chose to read the chain. Nothing in a scroll obliges it to.

## Definitions

- **Mark**, **leaf**, **moon**, **intent** — see the family [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md). A star is the leaf of an intent.
- **Row** — one link of the chain: `seq`, star `type`, `mark`, link `hash`, `leaf`, `prev` (the previous link's hash), `recordedAt` (when it was appended; the Worker's own row calls it `at`), `place`.
- **Scroll** — a closed moon's rows and their root, `GET /scroll?moon=` of the stars Worker.
- **Chain keeper** — the operator of the shared stars chain.

## Request

The moon of 11 October 2026 closed on 9 November. Two visitors committed in it:
one a constellation of two stars, one a single stone; each commit ends in its
`egg/find` row. Every value below re-derives.

```json
{
  "id": "urn:uuid:b6d40e2a-7f13-4c58-9a2e-e1c8f05d7b39",
  "type": "https://tasks.mages.city/spec/mages/moon/seal/0.1",
  "issuer": "did:web:agentprivacy.ai:stars",
  "recipient": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "issuedAt": "2026-11-10T00:00:00Z",
  "payload": {
    "moon": "moon-2026-10-11",
    "sealed": true,
    "endsAt": "2026-11-09T21:57:55.130Z",
    "stars": 5,
    "marks": 2,
    "root": "b1b3f553437f76a05fb0fba930502101c58a42371c6e69a692b50768e24fec74",
    "rule": "linkFoldV1",
    "rows": [
      { "seq": 100, "type": "thumb/up", "mark": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded", "hash": "84b48efeb82a1b5bbd491e32e478e2278c42ea6299422075db981d1daa0b2906", "leaf": "41182c4ff646f4ccbdccf0777fb08f0663e41e4458096e06f161d429a6fa04f3", "prev": "239ad7d4c40f907a5279518036713028150e503a7586035cec4594bb7a2c9d88", "recordedAt": "2026-11-01T12:00:00.000Z", "place": "/tailor" },
      { "seq": 101, "type": "promise/make", "mark": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded", "hash": "71c95085e1c685c09f8623fc0e38c56a945520ab7f48f9e78d18a7d56434b49d", "leaf": "82156633025de2aee9e51acb4107317ea19e3256ef782115f56039a1e3e42da3", "prev": "84b48efeb82a1b5bbd491e32e478e2278c42ea6299422075db981d1daa0b2906", "recordedAt": "2026-11-01T12:00:00.000Z", "place": "/promises" },
      { "seq": 102, "type": "egg/find", "mark": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded", "hash": "a90fbaf054fd38c3b28b6d284373d0d85865d5e9e001303518ecaab7acfc8aa2", "leaf": "6fa3c3dfa9e2427c20f277d9027eb8767becfa72ee6d350f2dd49e8bd8e680b5", "prev": "71c95085e1c685c09f8623fc0e38c56a945520ab7f48f9e78d18a7d56434b49d", "recordedAt": "2026-11-01T12:00:00.000Z", "place": "/vault" },
      { "seq": 103, "type": "island/stone", "mark": "542e8a6d6a7c20d56d55b7366a18313b13e0b011027d12dfb42604e1d7b7d0ad", "hash": "012af64226cc8724ea1f1cf9357418b9c25597250707c17dd70ed13b7b9b199d", "leaf": "719459e7251a34c2be356ef40bc63e7a8ef9e4703def76cfa6c1c18e238400c8", "prev": "a90fbaf054fd38c3b28b6d284373d0d85865d5e9e001303518ecaab7acfc8aa2", "recordedAt": "2026-11-05T08:00:00.000Z", "place": "/guide" },
      { "seq": 104, "type": "egg/find", "mark": "542e8a6d6a7c20d56d55b7366a18313b13e0b011027d12dfb42604e1d7b7d0ad", "hash": "6118dc41bf69e3c4133e7104ad2fd89c73cd4e28eb96e2ca7ae59f6ed439cbeb", "leaf": "c460be3c1c4281303081095d19b784aaad21207309332475501b779eb4b898d3", "prev": "012af64226cc8724ea1f1cf9357418b9c25597250707c17dd70ed13b7b9b199d", "recordedAt": "2026-11-05T08:00:00.000Z", "place": "/circle" }
    ]
  }
}
```

## Response

Mages City answers with a document whose `type` is the request's *Type URI*
with `#response`, conforming to `$defs.Response` in
[`payload.schema.json`](payload.schema.json): the moon, the root it re-derived
(equal to the scroll's, or it would have refused), the number of rows, and where
the scroll is published. Failures use `trust-task-error` with the codes above.

```json
{
  "id": "urn:uuid:0c9f2e71-5a4b-4d36-b8e2-93a7f1d6c058",
  "type": "https://tasks.mages.city/spec/mages/moon/seal/0.1#response",
  "threadId": "urn:uuid:b6d40e2a-7f13-4c58-9a2e-e1c8f05d7b39",
  "issuer": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "recipient": "did:web:agentprivacy.ai:stars",
  "issuedAt": "2026-11-10T00:00:05Z",
  "payload": {
    "moon": "moon-2026-10-11",
    "root": "b1b3f553437f76a05fb0fba930502101c58a42371c6e69a692b50768e24fec74",
    "rows": 5,
    "scrollRef": "https://mages.city/scrolls/moon-2026-10-11"
  }
}
```

## Security & Privacy

### Data carried

A scroll carries, for every row of one moon: the mark, the star type, the leaf,
the link hash and the previous one, the time of the append, and the place (the
first path segment of a public page). No star's content is carried; every value
was already served by the chain's public reads. A producer **MUST NOT** add
members to rows or to the scroll: the scroll is the chain's output, and anything
added would be published under the City's name.

### Correlation

A sealed scroll is a permanent public list of the marks active in a moon, and
because a mark is stable across moons, the scrolls together form a longitudinal
record per mark: which moons, how many stars, of which types, at which places
and times. That is the purpose of the record and the reason a visitor commits
deliberately. The parties' identifier scopes are `public`: the chain keeper and
the City are the two institutions a scroll is attributable to, and a reader must
recognise both for the scroll to mean anything; pairwise identifiers for them
would hide its provenance and protect no one. Per-moon marks (a mark derived
from the device secret and the moon) would break the cross-moon join and are an
open design question for a later version.

### Retention

Durable. The City keeps the scroll as the closed record of the season, and the
anchored root lets anyone check a later copy against it. Withdrawing a scroll
after publication would not withdraw copies already made; the protection lies
earlier, in what a row can contain.

### Consent/purpose

Each row is there because a visitor chose to commit it, knowing commits are
public and sealed by the moon. The City records scrolls so that members' stars
can be shown to have been on the chain in a given moon, and for that purpose
only: not to profile marks, which the City does not join to members unless a
member brings their own root through the Star Key.
