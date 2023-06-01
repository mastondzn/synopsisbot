import { gql } from 'graphql-request';

export const emoteSetsByTwitchId = gql`
    query getEmoteSetsByTwitchId($twitchId: String!) {
        userByConnection(platform: TWITCH, id: $twitchId) {
            id
            emote_sets {
                id
                name
                emotes {
                    id
                    name
                    timestamp
                    origin_id
                    data {
                        name
                    }
                }
            }
        }
    }
`;
