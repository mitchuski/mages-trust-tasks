---
slug: mages/contribution/dispose
version: "0.1"
title: Contribution — Dispose
summary: The guide's keeper answers one contribution (a note, a request, a recording) by its hash, as addressed (with the guide root where the change lives), declined, deferred or kept private, so no contribution is left without an answer.
status: draft
targetFrameworkVersion: "0.6.0"
category: governance
keywords:
  - mages-city
  - keeper
  - contribution
  - disposition
  - census
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Keeper (the keystone of the guide)
    requirement: REQUIRED
    member: issuer
    identifierScope: public
  - role: Contributor (by the mark the contribution was made under)
    requirement: REQUIRED
    member: recipient
    identifierScope: pairwise
proofRequirement:
  requirement: REQUIRED
  rationale: >-
    A disposition is the keeper's answer on the record: it closes a
    contribution, and an `addressed` one points at the guide root where the
    change lives. Only the keystone may write one, so a disposition that
    cannot be attributed to the keeper's key is worth nothing to the
    contributor or to the census.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    A contribution can be deferred and later addressed; the issue time orders
    two dispositions of the same contribution so the later one stands.
sideEffects:
  level: mutating
  rationale: >-
    Records the disposition in the keeper's ledger (kb/dispositions.json), which
    the census gate reads. A later disposition of the same contribution
    supersedes it; nothing is deleted.
consequences:
  - The contribution leaves the open count the keeper measures.
  - An `addressed` disposition binds the contribution to the guide root that answers it, which the census re-derives.
exposure:
  discloses: none
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Carries the contribution's hash, a disposition word, a guide root and an
    optional short note to the contributor. The contribution itself is never
    carried; the keeper already holds it.
retention:
  class: durable
  rationale: >-
    The dispositions are the keeper's public answer record and an input to the
    census gate that every guide release passes.
errorCodes:
  - code: mages/contribution/dispose:contributionUnknown
    meaning: No contribution swept from the guide's chain has this hash.
    retryable: false
  - code: mages/contribution/dispose:addressedWithoutRoot
    meaning: An `addressed` disposition must carry the guide root where the change lives.
    retryable: false
related:
  - mages/meet/confirm
  - mages/scroll/seal
---

## Abstract

The Hitchhiker's Guide collects contributions on its chain: proverbs, notes,
requests, voice recordings shared with the keeper. The keeper (the guide’s keeper agent)
sweeps them, re-derives their chain links, and the keystone answers each one.
**Contribution — Dispose** is that answer, made to the contributor by the hash
of what they contributed. Four answers exist: **addressed** (the change is in
the guide, at this root), **declined**, **deferred**, **keptPrivate**. The
keeper's census gate fails any release where a disposition cites a
contribution that does not exist, or an `addressed` one carries no root.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace
(`https://tasks.mages.city/spec/mages/`) as part of the **mages** family.
It describes `kb/dispositions.json` and `tools/census.mjs` of the guide’s keeper agent as of
17 November 2026, where the file spells the last disposition `kept-private`;
the document form spells it `keptPrivate` (SPEC §4.10). The schema **MAY**
change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the keystone) **MUST** emit a signed *Trust Task
document* whose `type` is
`https://tasks.mages.city/spec/mages/contribution/dispose/0.1`, with
`recipient` set to the mark the contribution was made under.

A conforming **consumer** (the keeper's ledger and census) **MUST**:

1. Refuse a disposition whose `contribution` names no swept contribution (`contributionUnknown`).
2. Refuse an `addressed` disposition without `guideRoot` (`addressedWithoutRoot`).
3. Record it, superseding any earlier disposition of the same contribution with an earlier `issuedAt`.

The contributor learns of it by reading the ledger or the guide; this task
defines no response beyond the framework acknowledgement.

## Definitions

- **Contribution hash** — the hash of the contribution's link on the guide's chain, as the sweep re-derives it: `sha256(prev | kind | scene | at | text)`.
- **Guide root** — the root of a built guide release, 64 lowercase hex.

## Request

```json
{
  "id": "urn:uuid:5e4d3c2b-1a09-4f8e-b7d6-c5b4a3928170",
  "type": "https://tasks.mages.city/spec/mages/contribution/dispose/0.1",
  "issuer": "did:web:trust.mages.city:keeper",
  "recipient": "542e8a6d6a7c20d56d55b7366a18313b13e0b011027d12dfb42604e1d7b7d0ad",
  "issuedAt": "2026-11-18T12:00:00Z",
  "payload": {
    "contribution": "8d6f4b2a0e8c6a4f2d0b8e6c4a2f0d8b6e4c2a0f8d6b4e2c0a8f6d4b2e0c8a6f",
    "disposition": "addressed",
    "guideRoot": "3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c",
    "note": "Your clue for the harbour scene is in the guide now."
  }
}
```

## Security & Privacy

### Data carried

A hash, a disposition word, a root, and at most 500 characters of note. The
contribution's text or audio is never carried. A keeper **MUST NOT** quote the
contribution in `note`.

### Correlation

The recipient is the contributor's mark, pairwise to the guide; the
disposition adds no identifier to it. The keeper's identifier scope is `public`
because a disposition is the keeper's answer on the record: the contributor
and the census must see that the guide's keystone made it, which a pairwise
keeper identifier would hide without protecting anyone.

### Retention

`durable`. Dispositions are kept with the guide's releases, as the census
reads them.

### Consent/purpose

A disposition answers what the contributor chose to give. `keptPrivate` is
the keeper's promise that the contribution shapes the guide without being
shown; a keeper **MUST NOT** later publish a contribution disposed that way.
