This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment (Docker)

To deploy this application on a server (e.g., Linux/Debian):

1.  **Extract files** (if using a zip):
    ```bash
    unzip tms-source.zip
    cd tms
    ```

2.  **Prepare Data Directory**:
    Create the `data` directory and ensure the container user (node, uid 1000) can write to it.
    ```bash
    mkdir -p data/uploads
    # Option 1: Give ownership to user 1000 (standard for node images)
    sudo chown -R 1000:1000 data
    # Option 2: Fallback (if user 1000 mapping is complex), give broad write permissions
    # chmod -R 777 data
    ```

3.  **Deploy**:
    ```bash
    docker-compose build --no-cache
    docker-compose up -d
    ```

4.  **Verify**:
    Check logs if needed:
    ```bash
    docker-compose logs -f
    ```
    Access the app at `http://your-server-ip:3000`.
