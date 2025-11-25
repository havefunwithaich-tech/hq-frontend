// hq-frontend/lib/graphql/mutations.js

// WPユーザーデータを更新するためのGraphQLミューテーション
export const UPDATE_USER_DATA = `
  mutation UpdateUserSubscription(
    $id: ID!
    $stripeCustomerId: String
    $subscriptionStatus: String
  ) {
    updateUser(
      input: {
        id: $id
        # カスタムフィールドの値をACFを通じて渡す
        stripeUserData: {
          stripeCustomerId: $stripeCustomerId
          subscriptionStatus: $subscriptionStatus
        }
      }
    ) {
      user {
        databaseId
        stripeUserData {
          stripeCustomerId
          subscriptionStatus
        }
      }
    }
  }
`;