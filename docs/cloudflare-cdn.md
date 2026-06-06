# Cloudflare R2 + CDN Setup



Domain: **cdn.abdelrhmanabdelkhalek.com**



## Local dev before CDN DNS is live



`cdn.abdelrhmanabdelkhalek.com` will fail with **ERR_NAME_NOT_RESOLVED** until you connect the R2 custom domain in Cloudflare. Until then:



```env

# Root .env and backend/.env

USE_CDN=false



# CRA .env

REACT_APP_USE_CDN=false

REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co

```



The app serves **Supabase storage URLs** (`*.supabase.co/storage/v1/object/public/...`). Restart the backend and `npm start` after changing env.



### Optional: R2 public `r2.dev` URL (no custom domain)



1. R2 bucket → **Settings** → **Public access** → allow access → copy `https://pub-….r2.dev`

2. Set while `USE_CDN=false`:



```env

R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev

REACT_APP_R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev

```



### Enable CDN after DNS works



1. Confirm DNS: `nslookup cdn.abdelrhmanabdelkhalek.com` returns Cloudflare IPs

2. Set `USE_CDN=true` and `REACT_APP_USE_CDN=true`, restart backend + frontend



---



## 1. R2 bucket



1. Cloudflare Dashboard → R2 → Create bucket `abdelrhmanabdelkhalek-assets`

2. Create API token (R2 read/write) → set in `.env`:

   - `R2_ACCOUNT_ID`

   - `R2_ACCESS_KEY_ID`

   - `R2_SECRET_ACCESS_KEY`



## 2. Custom domain (public CDN) — required for `USE_CDN=true`



1. Ensure **abdelrhmanabdelkhalek.com** zone is on Cloudflare (same account as R2).

2. R2 bucket → **Settings** → **Public access** → **Connect domain**

3. Enter `cdn.abdelrhmanabdelkhalek.com`

4. Cloudflare creates a **CNAME** (or proxied record) pointing to the R2 public hostname, e.g.  

   `cdn` → `<bucket>.<account>.r2.cloudflarestorage.com` (exact target shown in the dashboard).

5. Wait for DNS propagation; verify:



```bash

nslookup cdn.abdelrhmanabdelkhalek.com

curl -I https://cdn.abdelrhmanabdelkhalek.com/categories/categories/example.jpeg

```



6. Set `USE_CDN=true`, `REACT_APP_USE_CDN=true`, restart services.



If the subdomain does not resolve, the browser cannot load rewritten URLs — keep `USE_CDN=false`.



## 3. CORS (presigned browser uploads only)

When `REACT_APP_UPLOAD_VIA_API` is unset or `true` on **localhost**, the dashboard uploads through `POST /api/uploads/proxy` (backend → R2). No R2 CORS policy is required for local dev.

For **production presigned uploads** (browser PUT directly to R2), add this CORS policy on the R2 bucket (**Settings → CORS policy**):

```json
[
  {
    "AllowedOrigins": [
      "https://abdelrhmanabdelkhalek.com",
      "https://www.abdelrhmanabdelkhalek.com",
      "https://squash.abdelrhmanabdelkhalek.com",
      "https://abdelrhmanabdelkhalek-react.vercel.app",
      "http://localhost:3000",
      "http://localhost:4000"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Apply the CORS policy above before video uploads work on Vercel (files **> 4 MB** always use presigned PUT).

### Upload flow (dashboard)

| Mode | When | Browser request | Stored URL |
|------|------|-----------------|------------|
| **API proxy** | `localhost` or `REACT_APP_UPLOAD_VIA_API=true`, file **≤ 4 MB** | `POST /api/uploads/proxy` (multipart) → backend uploads via AWS SDK | `R2_PUBLIC_URL/...` or CDN when configured |
| **Presigned PUT** | file **> 4 MB** (always), or `REACT_APP_UPLOAD_VIA_API=false` | `POST /api/uploads/presign` → browser `PUT` to R2 | same public URL rules; requires R2 CORS above |

Set `R2_PUBLIC_URL` and `REACT_APP_R2_PUBLIC_URL` to your `pub-*.r2.dev` URL so uploads return a public URL, not `*.r2.cloudflarestorage.com`.



## 4. Cache rules



Cloudflare → **Caching** → **Cache Rules**:



| Match | Cache TTL | Notes |

|-------|-----------|-------|

| `cdn.abdelrhmanabdelkhalek.com/*.jpg` | 30 days | images |

| `cdn.abdelrhmanabdelkhalek.com/*.mp4` | 7 days | videos |

| `cdn.abdelrhmanabdelkhalek.com/*` | 1 day | default |



On upload (presigned PUT), set metadata `Cache-Control: public, max-age=31536000` for static assets.



## 5. URL mapping after migration



Migration toolkit writes `url_mapping.json`:



- Old: `https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>`

- New: `https://cdn.abdelrhmanabdelkhalek.com/<bucket>/<path>`



Run `npm run replace-urls` after `npm run upload-r2` **only when CDN DNS is live**, or keep DB on Supabase URLs until then.



## 6. Environment reference



| Variable | Role |

|----------|------|

| `USE_CDN` / `REACT_APP_USE_CDN` | `true` = rewrite to CDN; `false` = Supabase (default for dev) |

| `CDN_BASE_URL` / `REACT_APP_CDN_URL` | Custom CDN host when `USE_CDN=true` |

| `R2_PUBLIC_URL` / `REACT_APP_R2_PUBLIC_URL` | Optional `pub-*.r2.dev` base when CDN DNS pending |
| `REACT_APP_UPLOAD_VIA_API` | `true` = proxy for files ≤ 4 MB; files > 4 MB always presign; `false` = presign all (needs R2 CORS) |

| `MEDIA_BASE_URL` / `REACT_APP_MEDIA_BASE_URL` | Same as R2 public override |

| `REACT_APP_SUPABASE_URL` | Required for Supabase URL building when CDN off |



```env

USE_CDN=false

CDN_BASE_URL=https://cdn.abdelrhmanabdelkhalek.com

REACT_APP_USE_CDN=false

REACT_APP_CDN_URL=https://cdn.abdelrhmanabdelkhalek.com

REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co

```



After DNS is live:



```env

USE_CDN=true

REACT_APP_USE_CDN=true

```


