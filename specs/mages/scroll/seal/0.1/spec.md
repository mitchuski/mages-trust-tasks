---
slug: mages/scroll/seal
version: "0.1"
title: Scroll — Seal
summary: A mage asks Mages City to seal one or more κ evidence bundles as a scroll on its own mages.city subdomain; the City re-derives each bundle's root, publishes nothing but hashes, dates and numerals, and joins the hashes to its seal ledger.
status: draft
targetFrameworkVersion: "0.6.0"
category: provenance
keywords:
  - mages-city
  - scroll
  - kappa
  - evidence-bundle
  - seal-ledger
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Mage (the lane that minted the bundles)
    requirement: REQUIRED
    member: issuer
    identifierScope: public
  - role: Mages City (the Scriptorium)
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  requirement: REQUIRED
  rationale: >-
    A sealed scroll is permanent public evidence under the mage's name in the
    City's list of scrolls. The City must know which mage asked, and the mage
    must be able to show which root the City agreed to seal. The bundle's own
    integrity rests on its κ root, which the City re-derives regardless.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    Sealing publishes and registers a scroll, so it is consequential (SPEC
    §7.3 item 17); the scroll's book dates are read against it.
sideEffects:
  level: mutating
  rationale: >-
    Registers the scroll in the City's list of scrolls, writes its page on its
    subdomain, and joins its hashes to the seal ledger. A re-seal of the same
    scroll id adds books; it never edits a sealed book.
consequences:
  - A page of nothing but hashes, dates and numerals is published at the scroll's subdomain.
  - Every object, edge and root hash of every book joins the City's seal ledger.
  - The scroll joins the list of scrolls under its id; the id cannot then name another mage's scroll.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests bundle roots and the location the City fetches each bundle from.
    Bundles may hold anything, but only their hashes leave the City: the page
    builder refuses any value that is not a hash, a date or a numeral.
    Discloses the scroll's address and the count of hashes sealed.
retention:
  class: durable
  rationale: >-
    A scroll is a permanent record; its whole purpose is that a hash sealed
    today can be found on it later.
errorCodes:
  - code: mages/scroll/seal:rootMismatch
    meaning: A bundle fetched from its location does not re-derive the root the request names.
    retryable: false
  - code: mages/scroll/seal:notHashesOnly
    meaning: The scroll built from the bundles carries a value that is not a hash, a date or a numeral, so it would leak content.
    retryable: false
  - code: mages/scroll/seal:scrollIdTaken
    meaning: The scroll id already names another mage's scroll.
    retryable: false
  - code: mages/scroll/seal:bundleUnreachable
    meaning: The City could not fetch a bundle from the location given.
    retryable: true
related:
  - mages/moon/seal
  - mages/contribution/dispose
  - process-attestation
---

## Abstract

Every lane of agentprivacy work ends in a **κ evidence bundle**: a graph of
content-addressed objects and edges whose root anyone can re-derive with
kappa-evidence-mage. Mages City publishes such bundles as **scrolls**, one
subdomain each (formal.mages.city, sha256.mages.city, …), showing nothing but
the hashes. **Scroll — Seal** is a mage asking for that: here are my bundles
and their roots; the City fetches each, re-derives its root, builds the page,
refuses it if anything but a hash, date or numeral would show, and joins the
hashes to its seal ledger.

`mages/moon/seal` is the same act for one closed moon of the stars chain; this
task is the general one.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace
(`https://tasks.mages.city/spec/mages/`) as part of the **mages** family.
It describes `mages_city/bin/bundle-scroll.mjs` as of 17 November 2026, run by
hand today (the mages-scroll-sync skill), not as a service. The schema **MAY**
change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the mage) **MUST** emit a signed *Trust Task
document* whose `type` is
`https://tasks.mages.city/spec/mages/scroll/seal/0.1`, naming each bundle
by its sha256 root and a location the City can fetch it from.

A conforming **consumer** (the City) **MUST**, after framework and schema
validation:

1. Refuse a scroll id already registered to another issuer (`scrollIdTaken`).
2. Fetch each bundle (`bundleUnreachable` on failure) and re-derive its root; refuse on any difference (`rootMismatch`).
3. Build the scroll data and refuse it if any value is not a 64-hex hash, an ISO date, a roman numeral or a decimal integer (`notHashesOnly`).
4. Publish the page, register the scroll, join its hashes to the seal ledger, and answer with a `#response`.

## Definitions

- **κ evidence bundle** — a directory with `graph.json` (objects and κ-labelled edges) and `root.json` (`root_kappa`, optionally `root_blake3`, `minted_on`), verifiable with `verify_bundle.py`.
- **Book** — one bundle as shown on a scroll: its root, its objects' hashes, its edges' hashes.

## Request

```json
{
  "id": "urn:uuid:2b4d6f80-1a3c-4e5f-8790-a1b2c3d4e5f6",
  "type": "https://tasks.mages.city/spec/mages/scroll/seal/0.1",
  "issuer": "did:web:mages.city:formal-mage",
  "recipient": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "issuedAt": "2026-11-12T16:00:00Z",
  "payload": {
    "scroll": "formal",
    "domain": "formal.mages.city",
    "bundles": [
      {
        "root": "c52609b736406d6fe646db7e735e7380d4fb6309cc9c481480fb9709c5077e8e",
        "blake3": "99bb5f9031a804dfff8d5dbb4a17c3b499de6cea541ef480775170a9348dd63d",
        "mintedOn": "2026-11-12",
        "location": "https://github.com/mitchuski/trust-tasks-formal/tree/main/evidence/2026-11-12_tt188"
      }
    ]
  }
}
```

## Response

```json
{
  "id": "urn:uuid:8f6e4d2c-0b9a-4876-a5e4-d3c2b1a0f9e8",
  "type": "https://tasks.mages.city/spec/mages/scroll/seal/0.1#response",
  "threadId": "urn:uuid:2b4d6f80-1a3c-4e5f-8790-a1b2c3d4e5f6",
  "issuer": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "recipient": "did:web:mages.city:formal-mage",
  "issuedAt": "2026-11-12T16:00:09Z",
  "payload": {
    "href": "https://formal.mages.city/",
    "books": 1,
    "sealed": 380
  }
}
```

## Security & Privacy

### Data carried

Roots and locations in; an address and counts out. The bundles may contain
private material (notes, results); none of it leaves, because the page and the
ledger carry only hashes, and the builder refuses anything else. A mage whose
bundle location is private gives the City access out of band; the location is
not published.

### Correlation

The mage's identifier scope is `public`: a scroll is published under the mage's
name in the list of scrolls, and readers must see whose evidence it is; a pairwise
mage identifier would sever the scroll from the lane that answers for it. The
City's identifier scope is `public` for the same reason in reverse: the scroll is
the City's publication, and a pairwise City identifier would leave readers unable
to tell a real scroll from a copy. Hashes on a
scroll can be matched by anyone who holds the content they hash, which is the
point: a reader holding an artefact can show it was sealed.

### Retention

`durable`. Scrolls and the seal ledger are permanent.

### Consent/purpose

A mage seals their own bundles. The City **MUST NOT** seal a bundle on a
request from anyone but the mage that minted it, and **MUST NOT** publish any
value from a bundle other than its hashes, dates and numerals.
