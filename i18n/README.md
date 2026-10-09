# Localization

The English dictionary is the fallback. `es`, `de`, `it`, `fr`, and `pt` are
configured as empty dictionaries and can be populated without changing routes.
CMS translatable fields use `{ "en": "...", "es": "..." }`; missing locale
values resolve to English.

Use `/es/...`, `/de/...`, `/it/...`, `/fr/...`, or `/pt/...` to open a locale
route. A route only gets a locale-specific canonical and hreflang alternate
when its dictionary contains translated metadata under `routes["/path"]`.
Until then, the localized URL serves the English fallback and canonicals to
the English URL. The default English URL has no `/en` prefix.

Translation files use JSON and can be exchanged with:

```sh
npm run translations -- export es ./es.json
npm run translations -- import es ./es.json
```

Display-only currency conversion accepts `NEXT_PUBLIC_DISPLAY_CURRENCY_RATES`
as rates per USD, for example `{"USD":1,"EUR":0.92,"CAD":1.36}`. USD is
required as the base. Prices sent to checkout and payment providers remain USD.
The unit preference is stored locally and does not change stored product
dimensions or measurements sent to the API.
