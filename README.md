# Vanilla OS Image Marketplace

A VitePress site that lists Vanilla OS images. Posts live in series folders under `images/`; each series is described by the `index.md` of its folder, and each image is a single Markdown post with YAML frontmatter. The image page renders that image's `README.md` and `recipe.yml` directly from its repository, and the home page provides search, tag filters and two browsing views.

## Quick start

```bash
npm install
npm run dev      # local dev server
npm run build    # static build into .vitepress/dist
npm run preview  # preview the build
```

Requirements: Node.js 20+.

## Layout

```text
images/
  index.md            # site home (layout: marketplace)
  public/             # static assets
  gnome/
    index.md          # series cover
    gnome.md          # one image per file
    gnome-nvidia.md
    gnome-vm.md
  kde/
    index.md
    ...
```

Every `.md` file placed in the same folder as an `index.md` belongs to that
series. Files left directly under `images/` (next to the home `index.md`) are
listed as standalone images.

## Adding a series

Create a folder under `images/` with an `index.md`. The body is unused —
frontmatter is what matters:

```yaml
---
name: Vanilla OS GNOME Images
maintainer: official
status: normal
tags:
  - gnome
options:
  Hardware:
    "Generic": gnome.md
    "NVIDIA": gnome-nvidia.md
  "Virtual machine":
    "GNOME VM": gnome-vm.md
---
```

| Field        | Type                             | Default     | Description                                            |
| ------------ | -------------------------------- | ----------- | ------------------------------------------------------ |
| `name`       | string                           | file URL    | Series title shown on the home card and the series page |
| `maintainer` | `official` \| `community`        | `community` | Badge next to the title                                |
| `status`     | `normal` \| `outdated` \| `wip`  | `normal`    | Badge next to the title                                |
| `tags`       | string[]                         | `[]`        | Merged with the tags of every image in the series      |
| `options`    | mapping \| mapping[]             | —           | Guide used to pick an image (see below)                |

## Choosing an image (`options`)

`options` renders the “Choose an image” guide on the series page. Each
top-level key is a group (what the user is choosing by) and each nested
key/target pair is a choice linking to an image of the same folder:

```yaml
options:
  Hardware:
    NVIDIA: gnome-nvidia.md
  Region:
    "Mainland China": gnome-china.md
```

A list of single-key mappings works too. Deeper nesting is flattened into
labels joined with ` · `, which lets you split a group in sub-questions:

```yaml
options:
  - "Hardware":
      "NVIDIA": gnome-nvidia.md
  - "Virtual machine":
      "VM": gnome-vm.md
```

Targets are paths relative to the series folder (`.md` may be omitted, `./` is
allowed). Choices are rendered with the target's title; a target that does not
match a collected post still renders as a link, so keep it in sync with the
files.

## Adding an image

Create a `.md` file inside a series folder. The body is unused — frontmatter is
what matters:

```yaml
---
name: Vanilla OS GNOME Image
image: ghcr.io/vanilla-os/gnome
tag: latest
repo: https://github.com/Vanilla-OS/desktop-image
branch: dev
maintainer: official
status: normal
tags:
  - gnome
---
```

### Frontmatter reference

| Field        | Type               | Default     | Description                                                     |
| ------------ | ------------------ | ----------- | --------------------------------------------------------------- |
| `name`       | string             | file URL    | Post title shown on the card and the post header                |
| `image`      | string \| string[] | —           | Container image reference, e.g. `ghcr.io/owner/name`            |
| `tag`        | string \| string[] | `latest`    | Image tag(s)                                                    |
| `repo`       | string             | `''`        | Repository URL used to fetch `README.md` and `recipe.yml`       |
| `branch`     | string             | `main`      | Branch those files are read from                                |
| `maintainer` | `official` \| `community` | `community` | Badge next to the title                              |
| `status`     | `normal` \| `outdated` \| `wip` | `normal` | Badge next to the title; `normal` renders no status badge |
| `tags`       | string[]           | `[]`        | Home page filter tags and post hashtags                          |
| `collection` | boolean            | `false`     | Enables the image picker in the command bar (see below)          |
| `custom_raw` | string             | `''`        | Custom raw-file source for `README.md` / `recipe.yml`            |

Files without a valid `image` value are ignored by the listing; files without a
sibling `index.md` are listed as standalone images.

### Collections

`image` and `tag` accept arrays. References are expanded as follows:

| `image` | `tag`       | Result                                                        |
| ------- | ----------- | ------------------------------------------------------------- |
| single  | single      | one reference                                                 |
| list    | single      | every image paired with that same tag                         |
| single  | list        | that image paired with every tag                              |
| list    | list        | paired index by index; missing tags fall back to the last tag |

```yaml
---
name: Vanilla OS China Images
image: 
  - ghcr.io/vanilla-flavors/gnome-china
  - ghcr.io/vanilla-flavors/gnome-china-nvidia
  - ghcr.io/vanilla-flavors/gnome-china-nvidia-modern
  - ghcr.io/vanilla-flavors/gnome-china-vm
tag: latest
collection: true
repo: https://github.com/Vanilla-Flavors/china-image
branch: dev
maintainer: official
status: normal
tags:
  - gnome
  - china
  - nvidia
  - vm
---
```

With `collection: true` and more than one reference, the command bar turns into a dropdown so users can pick which `image:tag` to rebase to. Without it — or with a single reference — the command is shown as plain text.

### Custom raw source

By default files are fetched from the repository host, with GitHub going through `raw.githubusercontent.com`, then jsDelivr, then `github.com/.../raw/...` as fallbacks. Use `custom_raw` when the raw files live somewhere else:

```yaml
custom_raw: https://files.example.com/base            # -> {custom_raw}/{branch}/{file}
custom_raw: https://example.com/repo/raw/{branch}/{file}
```

`{branch}` and `{file}` are optional placeholders. `custom_raw` is tried first and falls back to the repository URLs, so `repo` may be omitted when only `custom_raw` is set.
