---
slug: mages/meet/open
version: "0.1"
title: Meet — Open
summary: A visitor opens a meeting at the guide and gets a five-character code to show the person they are meeting; nothing is on the chain yet.
status: draft
targetFrameworkVersion: "0.6.0"
category: reputation
keywords:
  - mages-city
  - hitchhikers-guide
  - meet-rite
  - bilateral
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Opener (the visitor who starts the meeting)
    requirement: REQUIRED
    member: issuer
    identifierScope: pairwise
  - role: Guide (the Hitchhiker's Guide chain)
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  request: OPTIONAL
  response: OPTIONAL
  rationale: >-
    Before joining, a visitor has only a mark and no key the guide recognises.
    The rite binds the two people by a short-lived code shown face to face,
    not by signatures. After joining, a member's VTA signs.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    A meeting lives ten minutes; every step must be placeable inside that
    window, and the step changes the meeting record (SPEC §7.3 item 17).
sideEffects:
  level: mutating
  rationale: >-
    Creates a meeting record holding the opener's mark and the night, which expires after 600 seconds. Nothing is appended to the chain.
consequences:
  - A meeting record exists for ten minutes under the returned code.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests the opener's mark. Discloses a fresh meeting code.
retention:
  class: exchange
  rationale: >-
    The meeting record lives ten minutes and is then dropped; only a confirmed meeting leaves a trace, the edge on the chain.
errorCodes:
  - code: mages/meet/open:slowDown
    meaning: The guide is rate-limiting this source; try again in a moment.
    retryable: true
related:
  - mages/meet/accept
  - mages/meet/confirm
---

## Abstract

The first step of the **Meet Rite**: two phones, two yeses, one edge. The
opener asks the guide for a meeting and shows its code, on screen or as a QR, to
the person in front of them. A meeting is not an edge: nothing reaches the chain
until the other says yes (`mages/meet/accept`) and the opener confirms
(`mages/meet/confirm`).

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under `https://tasks.mages.city/spec/mages/` as part of the **mages**
family. It describes `POST /api/meet/open` of the Hitchhiker's Guide Worker as of 17 November
2026, which does not yet accept the document form. The schema **MAY** change
without notice. The rite as a whole is the ceremony
`https://tasks.mages.city/ceremony/mages/meet/0.1`.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** sets `issuer` and `payload.mark` to the opener's mark.
A conforming **consumer** (the guide) **MUST** mint a code of five characters
from `abcdefghjkmnpqrstuvwxyz23456789` with a cryptographic random source, store
the opener's mark and the night under it for 600 seconds, and answer with the
code and when it closes.

## Definitions

- **Mark** — see [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md).

## Request

```json
{
  "id": "urn:uuid:0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  "type": "https://tasks.mages.city/spec/mages/meet/open/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:web:trust.mages.city",
  "issuedAt": "2026-11-17T19:41:30Z",
  "payload": {
    "mark": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded"
  }
}
```

## Response

```json
{
  "id": "urn:uuid:1b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e",
  "type": "https://tasks.mages.city/spec/mages/meet/open/0.1#response",
  "threadId": "urn:uuid:0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  "issuer": "did:web:trust.mages.city",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-17T19:41:30Z",
  "payload": {
    "code": "k7mpq",
    "expiresAt": "2026-11-17T19:51:30Z"
  }
}
```

## Security & Privacy

### Data carried

A mark in, a code out. No name, contact or location beyond the night the guide is running.

### Correlation

The meeting record holds the opener's mark for ten minutes; anyone shown the code learns nothing from it but that a meeting is open. The guide's identifier scope is `public` because the edge the rite ends
in is evidence each party carries to a community, which must see which guide
recorded it; a pairwise guide identifier would hide that and protect no one, the
guide being a public party.

### Retention

`exchange`: the record lives as long as the meeting, ten minutes.

### Consent/purpose

Opening a meeting commits the opener to nothing; a meeting no one accepts simply expires.
