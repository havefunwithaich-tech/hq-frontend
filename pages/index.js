// hq-frontend/pages/index.js

import { GraphQLClient, gql } from 'graphql-request';

// WP_GRAPHQL_URLを環境変数から読み込む
const endpoint = process.env.WP_GRAPHQL_URL;
const graphQLClient = new GraphQLClient(endpoint);

// GraphQLクエリの定義 (最新の投稿1件を取得)
const GET_POSTS = gql`
  query GetPosts {
    posts(first: 1) {
      nodes {
        title
        content
        slug
      }
    }
  }
`;

// サーバー側でビルド時に実行される関数 (SSG)
export async function getStaticProps() {
  try {
    const data = await graphQLClient.request(GET_POSTS);

    return {
      props: {
        post: data.posts.nodes[0] || null,
      },
      // 1時間ごとにWPの更新をチェック (ISR: Incremental Static Regeneration)
      revalidate: 3600,
    };
  } catch (error) {
    console.error("GraphQL Fetch Error:", error);
    // エラー時は空データを返し、ビルド失敗を避ける
    return {
      props: {
        post: { title: "Error loading content", content: "Check WP GraphQL setup." }
      },
    };
  }
}

// Next.jsのコンポーネント
export default function HomePage({ post }) {
  if (!post) {
    return <div>No posts found. Check your WP backend.</div>;
  }

  // WPから取得したコンテンツをそのまま表示
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <p style={{ textAlign: 'center', marginTop: '40px' }}>
        --- Content successfully fetched from WP Headless ---
      </p>
    </div>
  );
}