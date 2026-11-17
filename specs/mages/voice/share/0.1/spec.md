---
slug: mages/voice/share
version: "0.1"
title: Voice — Share
summary: After the fact and by choice, a visitor shares one of their committed voice notes with the keeper; the phone seals a copy to the keeper's public key, the guide stores what it cannot open, and the audio's hash goes on the chain.
status: draft
targetFrameworkVersion: "0.6.0"
category: data-exchange
keywords:
  - mages-city
  - hitchhikers-guide
  - voice
  - keeper
  - sealed-share
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
    Stores one keeper-sealed copy of the note, queues it for the keeper, counts it against the mark's nightly cap, and appends one `share` link binding the note and its audio hash.
consequences:
  - The keeper can open the shared copy; the guide cannot.
  - The audio's hash on the chain lets the keeper check the copy is the note committed.
exposure:
  discloses: metadata
  ingests: personal
  actsAsSubject: false
  rationale: >-
    Ingests a copy of a person's voice, sealed to the keeper's key so the guide stores it without being able to read it, and the audio's hash. Discloses the appended link.
retention:
  class: durable
  rationale: >-
    The sealed copy is kept for the keeper; the link stays on the chain.
maxDocumentBytes:
  request: 1048576
  rationale: >-
    One sealed copy is at most 480,000 base64 characters plus a wrapped key of at most 1,200; 1 MiB holds it with the envelope.
errorCodes:
  - code: mages/voice/share:notYours
    meaning: No voice link on this guide carries this note under this mark.
    retryable: false
  - code: mages/voice/share:alreadyShared
    meaning: This note has already been shared with the keeper.
    retryable: false
  - code: mages/voice/share:markLimit
    meaning: This mark has shared 3 notes tonight.
    retryable: false
  - code: mages/voice/share:slowDown
    meaning: The guide is rate-limiting this source; try again in a moment.
    retryable: true
  - code: mages/voice/share:chainFull
    meaning: The guide's chain accepts no more links.
    retryable: false
related:
  - mages/voice/commit
  - mages/contribution/dispose
---

## Abstract

A note committed with
[`mages/voice/commit`](../../../voice/commit/0.1/spec.md) stays the visitor's.
**Voice — Share** gives one to the keeper: the phone opens its own note, seals a
fresh copy to the keeper's public key (`/keeper.pub.jwk`, RSA-OAEP wrapping an
AES-GCM key), and sends only that. The guide stores a copy it cannot open, and
the chain gets the audio's hash, so the keeper can check that the copy is the
note committed.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under `https://tasks.mages.city/spec/mages/` as part of the **mages**
family. It describes `POST /api/voice/share` of the Hitchhiker's Guide Worker as of 17 November
2026, which does not yet accept the document form; the payload members are
named in the document form's spelling, and the Worker's own names are given
beside them. The schema **MAY** change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **consumer** (the guide) **MUST**, after framework and schema
validation:

1. Refuse unless a `voice` link with this `voice` exists on its chain under the issuer's mark (`notYours`).
2. Refuse a note already shared (`alreadyShared`) and a fourth share from this mark tonight (`markLimit`).
3. Store `{iv, ct, wrapped, audioHash}` for the keeper, append one `share` link whose leaf binds `voice` and `audioHash`, and answer with it.

The keeper, on opening the copy, **MUST** check `sha256(audio) == audioHash` and the link's presence before using it.

## Definitions

- **Mark**, **intent**, **leaf** — see [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md).

## Request

```json
{
  "id": "urn:uuid:8c9d0e1f-2a3b-4c4d-8e5f-6a7b8c9d0e1f",
  "type": "https://tasks.mages.city/spec/mages/voice/share/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:web:trust.mages.city",
  "issuedAt": "2026-11-17T21:30:00Z",
  "payload": {
    "voice": "1c3e5b7d9f0a2c4e6b8d1f3a5c7e9b0d2f4a6c8e1b3d5f7a9c0e2b4d6f8a1c3e",
    "audioHash": "3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b",
    "iv": "q83vEjRWeJA=",
    "ct": "T2dnUwACAAAAAAAAAAA=",
    "wrapped": "kX2bQ9mT0vR1sYp8LcA="
  }
}
```

## Response

```json
{
  "id": "urn:uuid:9d0e1f2a-3b4c-4d5e-9f6a-7b8c9d0e1f2a",
  "type": "https://tasks.mages.city/spec/mages/voice/share/0.1#response",
  "threadId": "urn:uuid:8c9d0e1f-2a3b-4c4d-8e5f-6a7b8c9d0e1f",
  "issuer": "did:web:trust.mages.city",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-17T21:30:01Z",
  "payload": {
    "seq": 377,
    "hash": "4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f"
  }
}
```

## Security & Privacy

### Data carried

A sealed copy of a voice note, its wrapped key and the audio's hash. The guide cannot open the copy; the keeper's private key never lives on the guide.

### Correlation

The share is joined to the visitor's mark and to the note's earlier link. The keeper hears the voice, which can identify the speaker; that is what sharing means. The guide's identifier scope is `public` because what it records is
evidence the visitor may later carry to a community, which must see which guide
recorded it; a pairwise guide identifier would hide that and protect no one, the
guide being a public party.

### Retention

`durable`. The sealed copy is kept for the keeper; the link stays on the chain.

### Consent/purpose

Sharing is after the fact, per note, by the visitor's choice, capped at 3 a night. The keeper **MUST NOT** pass a shared note on without the visitor's separate consent.
