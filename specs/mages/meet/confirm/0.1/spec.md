---
slug: mages/meet/confirm
version: "0.1"
title: Meet — Confirm
summary: The visitor who opened a meeting confirms it after the other has said yes, and the guide appends one bilateral meet edge (both marks) to its chain; two phones, two yeses, one edge.
status: draft
targetFrameworkVersion: "0.6.0"
category: reputation
keywords:
  - mages-city
  - hitchhikers-guide
  - meet-rite
  - bilateral
  - edge
  - hash-chain
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Opener (the visitor who started the meeting)
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
    Before joining, a visitor has only a mark, a hash of a device secret, and no
    key the guide recognises. The rite binds the two parties by a short-lived
    code shown face to face: only the opener holds the code with their own mark
    and only the acceptor's yes is recorded against it. The edge itself is a
    link on a public chain anyone can re-derive. After joining, a member's VTA
    signs the confirm.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    A confirm appends to the chain, so it is consequential (SPEC §7.3 item 17),
    and a meeting code lives ten minutes; a confirm must be placeable inside the
    meeting's window.
sideEffects:
  level: mutating
  rationale: >-
    Appends one `meet` link carrying both marks to the guide's chain and binds
    the meeting to it. The chain is append-only; the edge is never withdrawn.
consequences:
  - One `meet` link naming both marks is appended to the guide's chain, publicly readable and folded into the night's root.
  - The meeting is spent; a repeated confirm returns the same link and appends nothing.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests the meeting code and the opener's mark. Discloses the appended link
    (sequence, hash, both marks), which is public on the chain anyway.
retention:
  class: durable
  rationale: >-
    The edge is the record: it exists so either party can later show a
    community they met in person. Deleting it would break every later link.
errorCodes:
  - code: mages/meet/confirm:meetingClosed
    meaning: No open meeting has this code; codes last ten minutes from opening.
    retryable: false
  - code: mages/meet/confirm:notOpener
    meaning: The issuer is not the mark that opened the meeting, or nobody has said yes yet. Only the opener confirms, and only after the other's yes.
    retryable: true
  - code: mages/meet/confirm:chainFull
    meaning: The guide's chain accepts no more links tonight.
    retryable: false
related:
  - mages/meet/open
  - mages/meet/accept
  - vrc/relationships/propose
---

## Abstract

The **Meet Rite** of the Hitchhiker's Guide to Trust (trust.mages.city)
turns a meeting in the room into an edge. One visitor *opens* a meeting and
shows a five-character code; the other *accepts* it with their own mark; the
opener *confirms*, and only then does the guide append an edge naming both. A
scan is a meeting; an edge needs both to agree.

**Meet — Confirm** is the third, consequential step. The first two (open,
accept) change only a ten-minute meeting record and are named here so the rite
reads whole; they are `mages/meet/open` and `mages/meet/accept`, and the rite is
the ceremony `https://tasks.mages.city/ceremony/mages/meet/0.1`.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace
(`https://tasks.mages.city/spec/mages/`) as part of the **mages** family.
It describes `POST /api/meet/confirm` of the guide's Worker as of 17 November
2026, which does not yet accept the document form. The schema **MAY** change
without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the opener's phone) **MUST** emit a *Trust Task
document* whose `type` is
`https://tasks.mages.city/spec/mages/meet/confirm/0.1`, with `issuer` set
to the opener's mark and `payload.mark` equal to it, and **MUST** confirm only
after the meeting shows the other party's yes.

A conforming **consumer** (the guide) **MUST**, after framework and schema
validation:

1. Refuse a code with no open meeting (`meetingClosed`).
2. Refuse when `payload.mark` is not the meeting's opener, or the meeting has no acceptor (`notOpener`).
3. If the meeting already has a link, answer with that link and append nothing.
4. Otherwise append one `meet` link with content `{a, b}` (opener, acceptor) under the opener's mark, bind it to the meeting, and answer with it; refuse with `chainFull` when the chain is at capacity.

## Definitions

- **Mark** — `sha256("mark|" + secret)`, 64 lowercase hex, `secret` held only on the device.
- **Meeting code** — five characters from `abcdefghjkmnpqrstuvwxyz23456789`, minted at open, valid for 600 seconds.
- **Link** — one entry of the guide's chain: `seq`, `kind`, `hash` and the marks it names; `hash` folds the previous link's hash.

## Request

```json
{
  "id": "urn:uuid:7d3e1a90-5c2b-4f68-9e04-b1a2c3d4e5f6",
  "type": "https://tasks.mages.city/spec/mages/meet/confirm/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:web:trust.mages.city",
  "issuedAt": "2026-11-17T19:42:10Z",
  "payload": {
    "code": "k7mpq",
    "mark": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded"
  }
}
```

## Response

```json
{
  "id": "urn:uuid:c2b1a0f9-8e7d-4c6b-a5f4-e3d2c1b0a9f8",
  "type": "https://tasks.mages.city/spec/mages/meet/confirm/0.1#response",
  "threadId": "urn:uuid:7d3e1a90-5c2b-4f68-9e04-b1a2c3d4e5f6",
  "issuer": "did:web:trust.mages.city",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-17T19:42:11Z",
  "payload": {
    "seq": 318,
    "hash": "b4c9e2f17a3d5086c1e4f7a29b3d6c8e0f2a4b6d8c0e2f4a6b8d0c2e4f6a8b0c",
    "a": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
    "b": "542e8a6d6a7c20d56d55b7366a18313b13e0b011027d12dfb42604e1d7b7d0ad"
  }
}
```

## Security & Privacy

### Data carried

A meeting code and a mark in; a link with two marks out. No names, no
contact details, no location beyond the guide night the chain already records.

### Correlation

Both marks become public on the chain, joined by the edge: that is the
purpose. Each mark is pairwise to the guide and stable on that device, so a
visitor's meetings are joinable to each other and to their other stars under
the same mark. A visitor who wants a fresh start replaces the device secret.
The guide's identifier scope is `public` because the edge is evidence each party
carries to a community, which must see which guide recorded it; a pairwise
guide identifier would make the edge unverifiable and protect no one, the
guide being a public party.

### Retention

`durable`. The meeting record expires after ten minutes; the link stays on
the chain as the night's record.

### Consent/purpose

The edge needs both yeses: the acceptor's at accept, the opener's here. The
guide **MUST NOT** append an edge on one party's word. The edge records that
two people met; it is not a vouch, and a community reading it **MUST NOT**
treat it as one.
