---
slug: mages/presence/thumb
version: "0.1"
title: Presence — Thumb
summary: A visitor sends a thumbs up, "I was here", to a guide that keeps a chain; the guide appends a link under the visitor's mark (a witness link when the room's code is given) and holds the digest of the visitor's claim code for later.
status: draft
targetFrameworkVersion: "0.6.0"
category: provenance
keywords:
  - mages-city
  - hitchhikers-guide
  - thumbs-up
  - presence
  - witness
  - hash-chain
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Visitor (mark)
    requirement: REQUIRED
    member: issuer
    identifierScope: pairwise
  - role: Guide (a chain-keeping guide, such as the Hitchhiker's Guide)
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  request: OPTIONAL
  response: OPTIONAL
  rationale: >-
    Before joining, the visitor has only a mark and no key the guide recognises.
    What binds the visitor to the thumb is the claim code their phone minted and
    kept: the guide holds only its digest, so only that phone can later redeem
    it. The link is on a public chain anyone can re-derive. After joining, a
    member's VTA signs.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    A thumb appends to the chain (SPEC §7.3 item 17), and a witness code is
    valid only in its time window, so the guide must place the thumb in time.
sideEffects:
  level: mutating
  rationale: >-
    Appends one `thumb` link, or a `witness` link when the room's code checks,
    to the guide's chain under the visitor's mark, and stores the claim-code
    digest on it. Append-only.
consequences:
  - One link naming the mark is appended to the guide's chain and folded into the night's root.
  - Where a claim-code digest is given, it is held on the link so the code can later be redeemed for the night’s badge (vtc/badges/claims/redeem).
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests the mark, an optional digest and an optional witness code: hashes
    and a short window code, no personal data. Discloses the appended link.
retention:
  class: durable
  rationale: >-
    The link is the night's record that this mark was there; it stays on the
    chain, and the claim digest stays with it until redeemed or never.
errorCodes:
  - code: mages/presence/thumb:chainFull
    meaning: The guide's chain accepts no more links tonight.
    retryable: false
related:
  - mages/meet/confirm
  - mages/constellation/commit
  - vtc/badges/claims/redeem
  - witness/session
---

## Abstract

On a guide night, the first thing a visitor does is press 👍. **Presence —
Thumb** sends it: the guide appends a link under the visitor's **mark**, and,
if the visitor scanned the room's screen, a **witness** link that names the
place. The phone also mints a **claim code**, shows it once, and sends only its
digest; after joining Mages City, the member redeems the code for the night's
badge.

A thumb that is never sent (agentprivacy.ai holds its thumbs in the browser) is
not this task. It is the intent `thumb`
([CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md)), whose leaf may later ride
`mages/constellation/commit`.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace
(`https://tasks.mages.city/spec/mages/`) as part of the **mages** family.
It describes `POST /api/thumb` of the Hitchhiker's Guide Worker as of 17
November 2026, which does not yet accept the document form. Its claim code is
four words today; this specification replaces them with a `ClaimSecret` of the
upstream badge tasks (G1 of the guide-night badge profile). The
schema **MAY** change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the visitor's phone) **MUST** emit a *Trust Task
document* whose `type` is
`https://tasks.mages.city/spec/mages/presence/thumb/0.1`, with `issuer`
set to the mark. Where it mints a claim code, it **MUST** draw at least 128 bits
from a cryptographic random source, encode them base64url without padding,
keep the code on the device, show it to the visitor once, and send only
`claimDigest`.

A conforming **consumer** (the guide) **MUST**, after framework and schema
validation:

1. Check `witness` against the room's code for the current and previous window; when it checks, append a `witness` link with the night's place, otherwise a `thumb` link, and report `witnessed` and, when a code was given but did not check, `expired`.
2. Store `claimDigest`, where given, on the link and nowhere else.
3. Answer with the link, or refuse with `chainFull`.

## Definitions

- **Mark**, **intent** — see [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md).
- **Witness code** — the first 10 hex characters of `sha256("witness|" + key + "|" + night + "|" + window)`, shown on the room's screen and valid for its window and the one before.
- **Claim code** — a bearer secret the phone mints, in the shape of `ClaimSecret` from `vtc/badges` (`_shared/0.1/badge.schema.json`): at least 128 random bits, base64url, 22 to 64 characters. The phone shows it once, as a link (`https://trust.mages.city/claim#<code>`) and a QR, and keeps it; `claimDigest` is the lowercase hex sha256 of the code's ASCII bytes.

## Request

```json
{
  "id": "urn:uuid:3b6f2a1e-8c4d-4f7a-9e21-5d0c7b8a9f13",
  "type": "https://tasks.mages.city/spec/mages/presence/thumb/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:web:trust.mages.city",
  "issuedAt": "2026-11-17T19:05:00Z",
  "payload": {
    "claimDigest": "5f0c2a7e9b1d3f6a8c0e2b4d6f8a1c3e5b7d9f0a2c4e6b8d1f3a5c7e9b0d2f4a",
    "witness": "a41c9e0b2f"
  }
}
```

## Response

```json
{
  "id": "urn:uuid:6d5c4b3a-2918-4f07-8e6d-5c4b3a291807",
  "type": "https://tasks.mages.city/spec/mages/presence/thumb/0.1#response",
  "threadId": "urn:uuid:3b6f2a1e-8c4d-4f7a-9e21-5d0c7b8a9f13",
  "issuer": "did:web:trust.mages.city",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-17T19:05:01Z",
  "payload": {
    "seq": 291,
    "hash": "7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b",
    "kind": "witness",
    "witnessed": true
  }
}
```

## Security & Privacy

### Data carried

A mark, a digest and a window code in; a link out. The claim code itself never
leaves the phone. A producer **MUST NOT** add a note, referrer or anything
else: a thumb is a presence, not a message.

### Correlation

The mark is pairwise to the guide and stable on the device, so every link a
visitor makes under it is joinable; a fresh start is a new device secret. The
claim digest adds no correlation until redemption, which links the mark to a
member on purpose (see the badge profile). The guide's identifier scope is
`public` because the link is evidence the visitor later carries to a community,
which must see which guide recorded it; a pairwise guide identifier would hide
that and protect no one, the guide being a public party.

### Retention

`durable`. The link stays on the chain.

### Consent/purpose

The visitor presses 👍 to say they were here, for their own record and for the
community they may join. It is not analytics; the guide **MUST NOT** use marks
to follow visitors across nights beyond what the chain itself shows.
