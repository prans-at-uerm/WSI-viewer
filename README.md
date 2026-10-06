# MIL WSI Clinical Viewer — Prototype

## Run locally
You can open `index.html` directly in a browser, although using a local server is recommended.

For example, with Python:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

## Current prototype
- Six slide buttons
- All six currently point to the same sample slide
- Plain WSI on the left
- WSI + heatmap on the right
- Synchronized pan
- Synchronized zoom
- Reset button
- GitHub Pages-compatible static files

## Replacing the sample images
Replace:

slides/slide1/wsi.svg
slides/slide1/heatmap.svg

with your prototype images, then update the extensions in `app.js` if necessary.

## Moving to six real slides
Change the `folder` values in `app.js`:

```js
{ id: 1, label: "Slide 1", folder: "slide1" },
{ id: 2, label: "Slide 2", folder: "slide2" },
...
{ id: 6, label: "Slide 6", folder: "slide6" }
```

Then use:

slides/
  slide1/
    wsi.svg
    heatmap.svg
  slide2/
    wsi.svg
    heatmap.svg
  ...
  slide6/
    wsi.svg
    heatmap.svg

For the eventual full-resolution WSI implementation, ordinary JPG/PNG files should be replaced by tiled/deep-zoom images (e.g. OpenSeadragon-compatible tiles) so multi-gigabyte WSIs do not need to be loaded into the browser all at once.
