/** @type {import('next').NextConfig} */
const nextConfig = {
    
    eslint: {
        // Disabling ESLint during builds
        ignoreDuringBuilds: true,
        // If you only want to disable specific rules instead of all ESLint checks,
        // you'll need to create or modify your .eslintrc.js file instead
      },
};

export default nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     experimental: {
//       serverActions: true,
//     },
//     webpack: (config) => {
//       config.externals.push({
//         'utf-8-validate': 'commonjs utf-8-validate',
//         'bufferutil': 'commonjs bufferutil',
//       });
//       return config;
//     },
//   }
  
//   module.exports = nextConfig