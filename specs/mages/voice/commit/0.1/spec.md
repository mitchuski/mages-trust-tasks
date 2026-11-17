---
slug: mages/voice/commit
version: "0.1"
title: Voice — Commit
summary: A visitor puts a voice note on the guide's chain by its hash. Proof by default; the audio stays sealed on the phone; only a note offered to Hitchhiker FM is stored, sealed and open, with a cap per visitor.
status: draft
targetFrameworkVersion: "0.6.0"
category: data-exchange
keywords:
  - mages-city
  - hitchhikers-guide
  - voice
  - proof-by-default
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Visitor (mark)
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
    What is sent is bound by its hash on a public chain; after joining, a
    member's VTA signs.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    The task appends to the chain (SPEC §7.3 item 17), and the guide's limits
    are counted per night.
sideEffects:
  level: mutating
  rationale: >-
    Appends one `voice` link whose leaf binds the note's hash and its public words (what it is, which ceremony). Stores audio only when offered to Hitchhiker FM: the sealed box and the open copy, and counts the offer against the night's caps.
consequences:
  - The note's hash is on the chain, so the note cannot be swapped later.
  - Offered notes are stored and counted, at most 3 per mark and 400 per night.
exposure:
  discloses: metadata
  ingests: personal
  actsAsSubject: false
  rationale: >-
    In the default case ingests a hash and two public words. An offered note carries a person's voice, sealed and open: personal data. Discloses the appended link.
retention:
  class: durable
  rationale: >-
    The link stays on the chain. An offered note is kept for Hitchhiker FM; an unoffered note is never stored.
maxDocumentBytes:
  request: 1048576
  rationale: >-
    An offered note is at most 480,000 base64 characters sealed and as many open (about 45 seconds of opus each); 1 MiB holds both with the envelope.
errorCodes:
  - code: mages/voice/commit:proofMismatch
    meaning: The `voice` hash is not sha256("voice|" + iv + "|" + ct) of the offered sealed box.
    retryable: false
  - code: mages/voice/commit:guideFull
    meaning: The guide holds as many offered notes as it can tonight.
    retryable: false
  - code: mages/voice/commit:markLimit
    meaning: This mark has offered 3 notes tonight; the others stay on the phone.
    retryable: false
  - code: mages/voice/commit:slowDown
    meaning: The guide is rate-limiting this source; try again in a moment.
    retryable: true
  - code: mages/voice/commit:chainFull
    meaning: The guide's chain accepts no more links.
    retryable: false
related:
  - mages/voice/share
  - mages/contribution/dispose
---

## Abstract

A voice note is recorded and sealed on the phone (the intent `voice-seal`).
**Voice — Commit** puts it on the guide's chain by its hash, with two public
words: what it is (`proverb`, `poem`, `pledge`, `question`, `fortyTwo`, the Worker's `42`) and where it
was said (`personal`, `table`, `palava`). That is **proof by default**: the
guide stores no audio. A visitor who wants the note heard offers it to
Hitchhiker FM, and only then does the guide keep the sealed box and an open copy.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under `https://tasks.mages.city/spec/mages/` as part of the **mages**
family. It describes `POST /api/voice` of the Hitchhiker's Guide Worker as of 17 November
2026, which does not yet accept the document form; the payload members are
named in the document form's spelling, and the Worker's own names are given
beside them. The schema **MAY** change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** computes `voice` as lowercase hex
`sha256("voice|" + iv + "|" + ct)` over the sealed box, whether or not it offers
the note.

A conforming **consumer** (the guide) **MUST**, after framework and schema
validation:

1. Where `offer` is present: refuse a `voice` that does not re-derive from `offer.iv` and `offer.ct` (`proofMismatch`); refuse past 400 offered notes for the night (`guideFull`) or 3 for this mark (`markLimit`); store the sealed box and, where given, the open copy.
2. Append one `voice` link whose leaf hashes `voice`, `as` and `where`, and answer with it.

## Definitions

- **Mark**, **intent**, **leaf** — see [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md).

## Request

```json
{
  "id": "urn:uuid:6a7b8c9d-0e1f-4a2b-8c3d-4e5f6a7b8c9d",
  "type": "https://tasks.mages.city/spec/mages/voice/commit/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:web:trust.mages.city",
  "issuedAt": "2026-11-17T20:10:00Z",
  "payload": {
    "voice": "1c3e5b7d9f0a2c4e6b8d1f3a5c7e9b0d2f4a6c8e1b3d5f7a9c0e2b4d6f8a1c3e",
    "as": "pledge",
    "where": "table",
    "seconds": 18
  }
}
```

## Response

```json
{
  "id": "urn:uuid:7b8c9d0e-1f2a-4b3c-9d4e-5f6a7b8c9d0e",
  "type": "https://tasks.mages.city/spec/mages/voice/commit/0.1#response",
  "threadId": "urn:uuid:6a7b8c9d-0e1f-4a2b-8c3d-4e5f6a7b8c9d",
  "issuer": "did:web:trust.mages.city",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-17T20:10:01Z",
  "payload": {
    "seq": 351,
    "hash": "2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d"
  }
}
```

## Security & Privacy

### Data carried

By default: a hash, two public words and a length. Offered: also the sealed box and an open copy of the audio, which is a person's voice.

### Correlation

The note is joined to the visitor's mark on the chain. An open copy offered to Hitchhiker FM can identify the speaker by voice to anyone who hears it; that is the offer. The guide's identifier scope is `public` because what it records is
evidence the visitor may later carry to a community, which must see which guide
recorded it; a pairwise guide identifier would hide that and protect no one, the
guide being a public party.

### Retention

`durable`. The link stays on the chain. Offered notes are kept for Hitchhiker FM; nothing else is stored.

### Consent/purpose

Committing proves a note existed at a time without giving it. Offering it is a separate, explicit yes, capped per visitor, and the guide **MUST NOT** store audio that was not offered.
