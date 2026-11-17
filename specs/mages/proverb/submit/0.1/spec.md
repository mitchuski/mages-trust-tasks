---
slug: mages/proverb/submit
version: "0.1"
title: Proverb — Submit
summary: A visitor sends a proverb, a poem or a guide (a place and its first clue) to the guide's keeper; the words wait in the keeper's queue and only their leaf goes on the chain, under the visitor's mark.
status: draft
targetFrameworkVersion: "0.6.0"
category: data-exchange
keywords:
  - mages-city
  - hitchhikers-guide
  - proverb
  - poem
  - contribution
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
    Adds the words to the keeper's queue and appends one link whose leaf is the hash of the words (with the sealed copy, if one is given). The keeper later approves, rejects or hides them (mages/contribution/dispose).
consequences:
  - The words wait in the keeper's queue for a disposition.
  - One link with their leaf is appended to the chain, so the words cannot be changed later without the change showing.
exposure:
  discloses: metadata
  ingests: personal
  actsAsSubject: false
  rationale: >-
    Ingests words a person wrote and, if they choose, a name to sign them with: data about an identifiable person. Discloses the appended link.
retention:
  class: durable
  rationale: >-
    The keeper keeps the words until disposed; approved words become part of the guide. The link stays on the chain.
errorCodes:
  - code: mages/proverb/submit:slowDown
    meaning: The guide is rate-limiting this source; try again in a moment.
    retryable: true
  - code: mages/proverb/submit:keeperBusy
    meaning: The keeper's queue is full (500 waiting); try again later.
    retryable: true
  - code: mages/proverb/submit:chainFull
    meaning: The guide's chain accepts no more links.
    retryable: false
related:
  - mages/contribution/dispose
  - mages/presence/thumb
---

## Abstract

The guide collects what its visitors write: a **proverb** (one line), a **poem**
(a few lines), or a **guide**, a place with the first clue to finding it. Each
goes to the keeper, who answers it later
([`mages/contribution/dispose`](../../../contribution/dispose/0.1/spec.md)). The
chain records that the words were given, by their leaf, under the visitor's mark.

On agentprivacy.ai a proverb written and kept in the browser is the intent
`proverb`; it becomes this task only when it is sent.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under `https://tasks.mages.city/spec/mages/` as part of the **mages**
family. It describes `POST /api/submit` of the Hitchhiker's Guide Worker as of 17 November
2026, which does not yet accept the document form; the payload members are
named in the document form's spelling, and the Worker's own names are given
beside them. The schema **MAY** change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **consumer** (the guide) **MUST**, after framework and schema
validation:

1. Refuse a `guide` without a `title` of at least 3 characters, and any submission whose `text` is shorter than 3 characters, as `malformedRequest`; for `proverb` and `guide`, `text` is at most 160 characters, for `poem` at most 1,500.
2. Refuse when its queue holds 500 items (`keeperBusy`).
3. Queue the words, append one link of kind `kind` whose leaf hashes the words, and answer with the link.

## Definitions

- **Mark**, **intent**, **leaf** — see [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md).

## Request

```json
{
  "id": "urn:uuid:4e5f6a7b-8c9d-4e0f-8a1b-2c3d4e5f6a7b",
  "type": "https://tasks.mages.city/spec/mages/proverb/submit/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:web:trust.mages.city",
  "issuedAt": "2026-11-17T20:02:00Z",
  "payload": {
    "kind": "proverb",
    "text": "A key shown is not a key given.",
    "by": "a hitchhiker"
  }
}
```

## Response

```json
{
  "id": "urn:uuid:5f6a7b8c-9d0e-4f1a-9b2c-3d4e5f6a7b8c",
  "type": "https://tasks.mages.city/spec/mages/proverb/submit/0.1#response",
  "threadId": "urn:uuid:4e5f6a7b-8c9d-4e0f-8a1b-2c3d4e5f6a7b",
  "issuer": "did:web:trust.mages.city",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-17T20:02:01Z",
  "payload": {
    "seq": 344,
    "hash": "9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f"
  }
}
```

## Security & Privacy

### Data carried

The words, an optional signature name, an optional place for a guide, and an optional sealed copy. What goes on the chain is the leaf alone.

### Correlation

The submission is joined to the visitor's mark on the chain. A name in `by` is the visitor's choice and is shown with the words if they are approved. The guide's identifier scope is `public` because what it records is
evidence the visitor may later carry to a community, which must see which guide
recorded it; a pairwise guide identifier would hide that and protect no one, the
guide being a public party.

### Retention

`durable`. Queued words are kept until the keeper disposes of them; approved words become part of the guide; the link stays on the chain.

### Consent/purpose

The visitor gives the words to the guide to be read, kept or declined by its keeper. `offerToFm` is a separate yes: only words marked so may be read on Hitchhiker FM.
