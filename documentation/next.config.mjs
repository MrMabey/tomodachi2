import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  basePath: isGithubActions ? '/tomodachi' : '',
  assetPrefix: isGithubActions ? '/tomodachi/' : '',
};

export default withMDX(config);
