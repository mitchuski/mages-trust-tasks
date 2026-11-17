---
slug: mages/meet/accept
version: "0.1"
title: Meet — Accept
summary: The person shown a meeting code says yes with their own mark; the guide records them as the meeting's second party, and only the opener can now confirm the edge.
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
  - role: Acceptor (the visitor shown the code)
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
    Records the acceptor's mark on the open meeting. Nothing is appended to the chain until the opener confirms.
consequences:
  - The meeting names its acceptor; a different mark can no longer accept it.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests the code and the acceptor's mark. Discloses the opener's mark, so the acceptor can see whom they are meeting before the edge is made.
retention:
  class: exchange
  rationale: >-
    The acceptor's mark stays on the meeting record for the rest of its ten minutes, then goes with it unless the opener confirms.
errorCodes:
  - code: mages/meet/accept:meetingClosed
    meaning: No open meeting has this code; codes last ten minutes from opening.
    retryable: false
  - code: mages/meet/accept:ownMeeting
    meaning: The acceptor is the opener, and a meeting needs two different marks.
    retryable: false
  - code: mages/meet/accept:alreadyAccepted
    meaning: Another mark has already accepted this meeting.
    retryable: false
  - code: mages/meet/accept:slowDown
    meaning: The guide is rate-limiting this source; try again in a moment.
    retryable: true
related:
  - mages/meet/open
  - mages/meet/confirm
---

## Abstract

The second step of the **Meet Rite**. The person shown the code types or scans
it and says yes. The guide records their mark against the meeting and shows them
the opener's mark. Saying yes is the acceptor's whole consent to the edge; the
opener's is the confirm that follows.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under `https://tasks.mages.city/spec/mages/` as part of the **mages**
family. It describes `POST /api/meet/accept` of the Hitchhiker's Guide Worker as of 17 November
2026, which does not yet accept the document form. The schema **MAY** change
without notice. The rite as a whole is the ceremony
`https://tasks.mages.city/ceremony/mages/meet/0.1`.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **consumer** (the guide) **MUST**, after framework and schema
validation:

1. Refuse a code with no open meeting (`meetingClosed`).
2. Refuse when `payload.mark` is the meeting's opener (`ownMeeting`).
3. Refuse when the meeting already names a different acceptor (`alreadyAccepted`); the same acceptor accepting again is answered as before.
4. Record the acceptor and answer with the opener's mark.

## Definitions

- **Mark** — see [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md).

## Request

```json
{
  "id": "urn:uuid:2c3d4e5f-6a7b-4c8d-8e9f-1a2b3c4d5e6f",
  "type": "https://tasks.mages.city/spec/mages/meet/accept/0.1",
  "issuer": "542e8a6d6a7c20d56d55b7366a18313b13e0b011027d12dfb42604e1d7b7d0ad",
  "recipient": "did:web:trust.mages.city",
  "issuedAt": "2026-11-17T19:41:55Z",
  "payload": {
    "code": "k7mpq",
    "mark": "542e8a6d6a7c20d56d55b7366a18313b13e0b011027d12dfb42604e1d7b7d0ad"
  }
}
```

## Response

```json
{
  "id": "urn:uuid:3d4e5f6a-7b8c-4d9e-9f0a-2b3c4d5e6f7a",
  "type": "https://tasks.mages.city/spec/mages/meet/accept/0.1#response",
  "threadId": "urn:uuid:2c3d4e5f-6a7b-4c8d-8e9f-1a2b3c4d5e6f",
  "issuer": "did:web:trust.mages.city",
  "recipient": "542e8a6d6a7c20d56d55b7366a18313b13e0b011027d12dfb42604e1d7b7d0ad",
  "issuedAt": "2026-11-17T19:41:55Z",
  "payload": {
    "opener": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded"
  }
}
```

## Security & Privacy

### Data carried

A code and a mark in; the opener's mark out.

### Correlation

Accepting joins the two marks on the meeting record, and on the chain if the opener confirms; that is the purpose of the rite. The guide's identifier scope is `public` because the edge the rite ends
in is evidence each party carries to a community, which must see which guide
recorded it; a pairwise guide identifier would hide that and protect no one, the
guide being a public party.

### Retention

`exchange`: the meeting record and the acceptor's mark on it last ten minutes.

### Consent/purpose

The acceptor's yes is necessary for the edge and is not sufficient: the opener must confirm. The guide **MUST NOT** treat an accepted meeting as an edge.
