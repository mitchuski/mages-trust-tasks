---
slug: mages/constellation/commit
version: "0.1"
title: Constellation — Commit
summary: Once per moon, a visitor sends up to 42 deliberate stars, as hashes only, to the shared stars chain, with this moon's hidden star and a proof of work; the chain appends them and answers with where they landed.
status: draft
targetFrameworkVersion: "0.6.0"
category: provenance
keywords:
  - agentprivacy
  - stars
  - constellation
  - proof-of-work
  - hash-chain
  - moon
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Visitor (mark)
    requirement: REQUIRED
    member: issuer
    identifierScope: pairwise
  - role: Stars chain
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  request: OPTIONAL
  response: OPTIONAL
  rationale: >-
    Before joining, the visitor has no DID and no key the chain recognises, so
    the request is bound by hash commitments instead of a signature: the proof
    of work is computed over the mark, the moon, the folded leaves and the
    hidden star, and the appended links fold into a head anyone can recompute.
    After joining through the Star Key, the member's VTA signs the request (the
    site's signer is the mldsa65-ed25519 composite), which is also what would
    let the chain tell a mark's owner from someone using a mark read off the
    chain. The response is a pointer into a public, re-derivable chain; its
    claims are checked against the chain itself, not against a signature.
issuedAtRequirement:
  requirement: REQUIRED
  rationale: >-
    A commit appends to the chain and spends the mark's one constellation for
    the moon, so it is consequential (SPEC §7.3 item 17); the consumer must be
    able to place it in a window, and the moon it names must be the moon its
    issuedAt falls in.
sideEffects:
  level: mutating
  rationale: >-
    Appends one row per star plus one egg/find row to the shared chain and
    records that this mark has committed for this moon. The chain is
    append-only: the rows are never withdrawn, though they carry only hashes.
consequences:
  - The stars and one egg/find row are appended to the shared chain and cannot be withdrawn.
  - This mark's constellation for the moon is spent; a second commit under the same mark and moon is refused.
  - The rows (mark, type, leaf, link hash, time, place) become readable by anyone through the chain's public reads, and are sealed into the moon's scroll when the moon closes.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests the visitor's mark, each star's type, leaf and place (the first
    path segment of a public page), the hidden star's page and hash, and a
    nonce: commitments and coarse public places, never content. Discloses the
    sequence numbers the rows landed at and the chain's new head.
retention:
  class: durable
  rationale: >-
    The appended rows are the record: the chain exists so that a visitor's
    constellation can later be shown to a community (Mages City) and re-derived
    by anyone. Deleting a row would break every link after it.
errorCodes:
  - code: mages/constellation/commit:notThisMoon
    meaning: The request names a moon other than the one now open. A constellation is committed in the moon it belongs to.
    retryable: false
  - code: mages/constellation/commit:duplicateStar
    meaning: The same leaf appears more than once in the constellation.
    retryable: false
  - code: mages/constellation/commit:hiddenStarNotFound
    meaning: The hidden star does not re-derive. Its hash must equal sha256("egg|" + mark + "|" + moon + "|" + page).
    retryable: false
  - code: mages/constellation/commit:workInsufficient
    meaning: The proof of work does not reach the chain's difficulty (16 leading zero bits in this version).
    retryable: false
  - code: mages/constellation/commit:alreadyCommitted
    meaning: This mark's constellation for this moon is already on the chain.
    retryable: false
  - code: mages/constellation/commit:chainFull
    meaning: The chain has reached its capacity and accepts no further rows.
    retryable: false
related:
  - mages/presence/thumb
  - mages/island/stone
  - mages/moon/seal
  - trust-task-error
---

## Abstract

Stars are intents held in the visitor's browser: acts no one else receives.
**Constellation — Commit** is the one
way they leave: once per moon, the visitor chooses up to **42 deliberate stars**
and sends them to the site's shared **stars chain** as hashes only (a type, a
leaf, and the first segment of the page each was made on). Two conditions ride
with them: this moon's **hidden star**, found with the floating orbs, and a
**proof of work** the browser computes over everything committed. The chain
appends the stars, then one `egg/find` row for the hidden star, and answers with
the sequence numbers they landed at and its new head.

Content never arrives. The chain holds commitments; the things committed stay
with the person.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace (`https://tasks.mages.city/spec/mages/`) as part of the **mages** family; this is the agentprivacy.ai profile of it. It describes the stars Worker
of 16 November 2026 (`POST /constellation`); the Worker does not yet accept the
document form, and the mapping below is how it will. The schema **MAY** change
without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the visitor's browser) **MUST**:

1. Emit a *Trust Task document* whose `type` is `https://tasks.mages.city/spec/mages/constellation/commit/0.1`, with `issuer` set to the mark (before joining, equal to `payload.mark`) and `recipient` set to the chain's identifier.
2. Carry only deliberate stars of the moon named in `payload.moon`, at most 42, each leaf distinct. Passive stars (a workshop entered, a key charged) never leave the browser.
3. Compute the hidden star's hash as `sha256("egg|" + mark + "|" + moon + "|" + page)`.
4. Compute the proof of work as below and carry the `nonce` that meets it.

A conforming **consumer** (the stars chain) **MUST**, in this order, after
framework and schema validation:

1. Refuse a request whose `payload.moon` is not the moon now open (`notThisMoon`).
2. Refuse a constellation in which a leaf repeats (`duplicateStar`). Over 42 stars, an empty list, a passive type, or a non-hex leaf fail the payload schema (`malformedRequest`).
3. Refuse a hidden star that does not re-derive (`hiddenStarNotFound`).
4. Refuse a nonce whose work falls short of the chain's difficulty (`workInsufficient`).
5. Refuse a second commit for the same mark and moon (`alreadyCommitted`). A bit-for-bit retry of a document already accepted is absorbed under [SPEC §7.2](/SPEC.md#72-consumer-requirements) item 11 and answered with the original response, not this error.
6. Append each star in the order given, then one `egg/find` row whose leaf is the hidden star's hash and whose place is its page, each link computed as `hash = sha256(prev + "|" + leaf + "|" + mark + "|" + seq)`; record the mark and moon as committed; and answer with a `#response`.

### Proof of work

```
setRoot = 64 zeros
for each star, in order:  setRoot = sha256(setRoot + "|" + leaf)
work    = sha256("pow|" + mark + "|" + moon + "|" + setRoot + "|" + egg.hash + "|" + nonce)
accept  iff  leadingZeroBits(work) >= D          (D = 16 in this version)
```

`nonce` is written in decimal. `leadingZeroBits` counts zero bits from the most
significant end of the 256-bit digest. The work binds everything the commit
carries, so a nonce cannot be lifted onto another set of stars, another moon or
another mark.

## Authorization

**No authority is presumed.** The task is open to any mark: a mark is a hash of
a secret any browser can mint, and before joining nothing on the wire proves
that the producer holds the secret behind the mark it names. The conditions the
consumer applies are **admission conditions**, not entitlements, and each is
named for what it is:

- **The moon and the once-per-moon rule** bound how much any one mark can append: one constellation of at most 42 stars, plus one `egg/find` row, per moon.
- **The hidden star** binds the commit to a page and a moon, and is the ritual a visitor performs before committing. It is not a secret: its hash is computable by anyone who knows the mark, the moon and the page, and this version of the chain does not check that the page is the one the hidden star hid on for that mark.
- **The proof of work** is a cost (about 65,000 hashes at D = 16) that makes bulk minting of marks and constellations expensive. It is not identity.
- **The rate limit** (a salted, daily hash of the connecting address, held in memory only) slows a single source.

What keeps this safe to leave open is what the chain stores: hashes only.
An admitted forger can append only commitments to nothing. The open weakness is
**mark squatting**: a mark is readable on the chain, so a third party can commit
under someone else's mark first and spend that mark's constellation for the moon
(see Security & Privacy). After joining, the member's VTA signature on the
request is the authority the chain checks, and the mark is then bound to a key.

## Definitions

- **Mark**, **leaf**, **moon**, **intent** — see the family [CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md). A star is the leaf of an intent.
- **Deliberate star** — a star a visitor made on purpose: `thumb/up`, `proverb/write`, `promise/make`, `promise/keep`, `record/leave`, `note/leave`, `guide/walk`, `island/quest`, `island/stone`, `artefact/present`, `workshop/presence`, `proverb/inscribe`, `spellbook/inscribe`. Only these may be committed.
- **Place** — the first segment of the page path a star was made on (`/tailor`, never more).
- **Hidden star** (`egg`) — this moon's hidden star: a page and `sha256("egg|" + mark + "|" + moon + "|" + page)`.
- **Head** — the hash of the chain's newest link.

## Request

The Worker body maps onto the document exactly: `mark`, `moon`, `stars`,
`egg` and `nonce` are the payload members, and the envelope adds `id`, `type`,
`issuer`, `recipient` and `issuedAt`. This visitor commits three stars in the
moon of 9 November 2026; the nonce meets D = 16 (its work hash begins `000039b6`).

```json
{
  "id": "urn:uuid:9c1e47d2-6b3a-4f0e-8d75-2a4c19e8b301",
  "type": "https://tasks.mages.city/spec/mages/constellation/commit/0.1",
  "issuer": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "recipient": "did:web:agentprivacy.ai:stars",
  "issuedAt": "2026-11-16T10:00:00Z",
  "payload": {
    "mark": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
    "moon": "moon-2026-11-09",
    "stars": [
      { "type": "thumb/up", "leaf": "6aaf0638e9569dae87d3ecaa72b09c3fda3ad38dba56562b09a959e59d507572", "place": "/tailor" },
      { "type": "proverb/write", "leaf": "dcf38c02b565fda3cb73f79a083e0c4c8d86b12986e186ec5e4d0341b12d2a94", "place": "/proverbs" },
      { "type": "island/stone", "leaf": "c33a410305eb8d8f2f566172492af8f3d28254fee885b0eaf18c8109d2b8ad4f", "place": "/guide" }
    ],
    "egg": {
      "page": "/tailor",
      "hash": "951ae6a1dd4b6cdf297bd9e72a16d3454619ac28682dae1fed8d89e7c482df7b"
    },
    "nonce": 62839
  }
}
```

## Response

The chain answers with a document whose `type` is the request's *Type URI*
with `#response`, conforming to `$defs.Response` in
[`payload.schema.json`](payload.schema.json). `first` and `last` are the
sequence numbers of the first star and of the `egg/find` row, so the commit
occupies `last - first + 1 = stars + 1` rows; `head` is the chain's head after
the append. A producer checks the claim by reading those rows back (`GET
/chain?since=first`) and re-deriving the links. Failures use `trust-task-error`.

```json
{
  "id": "urn:uuid:5a0f3d6e-2c19-4b7a-a8e4-71d2c6b09f45",
  "type": "https://tasks.mages.city/spec/mages/constellation/commit/0.1#response",
  "threadId": "urn:uuid:9c1e47d2-6b3a-4f0e-8d75-2a4c19e8b301",
  "issuer": "did:web:agentprivacy.ai:stars",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-16T10:00:01Z",
  "payload": {
    "first": 1207,
    "last": 1210,
    "head": "c1f0a9e47b2d3586e0f4a1b9c7d2e358f6a0b4c1d9e7f2a3b5c6d8e0f1a2b3c4",
    "stars": 3
  }
}
```

### Errors

The Worker's HTTP statuses map onto `trust-task-error` codes:

| Worker | Condition | `code` | `retryable` |
|---|---|---|---|
| 400 | body is not JSON; mark not 64 hex; no stars or over 42; a passive type, a non-hex leaf or a bad place | `malformedRequest` | `false` |
| 400 | moon is not the moon now open | `constellation/commit:notThisMoon` | `false` |
| 400 | a leaf appears twice | `constellation/commit:duplicateStar` | `false` |
| 403 | POST from an origin that does not keep stars | `permissionDenied` | `false` |
| 403 | hidden star does not re-derive | `constellation/commit:hiddenStarNotFound` | `false` |
| 403 | proof of work falls short | `constellation/commit:workInsufficient` | `false` |
| 409 | this mark's constellation for this moon is already committed | `constellation/commit:alreadyCommitted` | `false` |
| 429 | too many requests from one source in a minute | `unavailable` | `true`, with `retryAfter` |
| 503 | the chain is full | `constellation/commit:chainFull` | `false` |

A second commit in the same moon, refused:

```json
{
  "id": "urn:uuid:e7b2c901-4d6a-4f3e-b1a8-0c9d5e7f2a64",
  "type": "https://trusttasks.org/spec/trust-task-error/0.5",
  "threadId": "urn:uuid:9c1e47d2-6b3a-4f0e-8d75-2a4c19e8b301",
  "issuer": "did:web:agentprivacy.ai:stars",
  "recipient": "2e1dba5c6e34487e6cbd9de6e673f0f173bdeb94eabe630fcca7aae4428acded",
  "issuedAt": "2026-11-16T10:05:00Z",
  "payload": {
    "code": "mages/constellation/commit:alreadyCommitted",
    "inResponseTo": {
      "typeUri": "https://tasks.mages.city/spec/mages/constellation/commit/0.1",
      "id": "urn:uuid:9c1e47d2-6b3a-4f0e-8d75-2a4c19e8b301"
    },
    "message": "Your constellation for this moon is already committed.",
    "retryable": false
  }
}
```

## Security & Privacy

### Data carried

The request carries the mark, the moon, and for each star a type, a leaf and a
place; the hidden star's page and hash; and a nonce. No star's content travels:
a leaf is a hash, and a leaf v2 is blinded by its intent document's random `id`
([CONVENTIONS](../../../_shared/0.1/CONVENTIONS.md)). A place is the first
path segment of a public page. The response carries two sequence numbers, a
count and the head. A producer **MUST NOT** add members: the schema is closed,
and the chain is public.

### Correlation

Everything committed is public: the chain's reads (`/recent`, `/chain`,
`/evidence?mark=`, `/scroll?moon=`) serve every row with its mark, type, leaf,
time and place. The mark is pairwise to agentprivacy.ai but **stable across
moons**, so every constellation a mark commits is joinable into one longitudinal
record, and the sealed scrolls ([`moon/seal`](../../../moon/seal/0.1/spec.md))
make that record permanent. That is the purpose of the record, and its cost: a
visitor who wants unlinkable seasons must change the device secret. The places,
the types and the commit time add a coarse activity profile per mark. Leaves
blinded by a random `id` do not add to it; **leaf v1 stars do**, because their
preimage is a type, a small content object and a millisecond timestamp, and a
committed v1 `thumb/up` leaf can be recovered by searching pages × times within
its moon. The chain's identifier scope is `public` because a visitor must be
able to recognise the one shared chain that a community will later read; a
pairwise identifier per visitor would split that chain and protect no one.

The address of the connecting client is never stored: the rate limit keys on a
truncated, salted, daily hash held only in memory.

**Mark squatting.** Because a mark is public and nothing proves control of it
before joining, anyone can compute a valid hidden star and proof of work for
another visitor's mark and commit first, spending that mark's constellation for
the moon (`alreadyCommitted` for the real owner). The rows such a commit adds
are noise, but the denial is real. The remedy is to bind the mark to a key
(a signed request, or a mark derived from a public key) and is the reason the
proof requirement rises after joining.

### Retention

Durable and append-only. The rows are retained for the life of the chain, and
each closed moon's rows are sealed into a scroll. Deleting a row would break
every later link; what can be forgotten instead is the content, which the
visitor holds and may delete, leaving a leaf no one can open.

### Consent/purpose

The visitor commits to show their stars to a community that chooses to read
them, starting with Mages City. The commit is the visitor's act, made once per
moon with stars they chose; the chain uses what it receives to keep and serve
the record, and for nothing else: not analytics, not identification.
