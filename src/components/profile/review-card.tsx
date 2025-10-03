import { BodySmall, Caption, IconSymbol } from '@/components/ui';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import type { EntityId, Review, User } from '@/types';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import React from 'react';
import { formatShortDate } from '@/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

interface ReviewCardProps {
  review: Review;
  reviewer?: User;
  language?: string;
  onVote?: (reviewId: EntityId) => void;
  isVoting?: boolean;
}

export const ReviewCard = React.memo<ReviewCardProps>(
  ({ review, reviewer, language = 'en', onVote, isVoting = false }) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? 'light';
    const textColor = useThemeColor({}, 'text');

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: Colors[colorScheme].backgroundSecondary },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.reviewerInfo}>
            {reviewer && (
              <>
                {reviewer.attributes.avatar_url ? (
                  <Image
                    source={{ uri: reviewer.attributes.avatar_url }}
                    style={styles.reviewerAvatar}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View
                    style={[
                      styles.reviewerAvatarPlaceholder,
                      {
                        backgroundColor: Colors[colorScheme].background,
                      },
                    ]}
                  >
                    <IconSymbol
                      name="person.fill"
                      size={16}
                      color={Colors.neutral.gray[400]}
                    />
                  </View>
                )}
                <View style={styles.reviewerDetails}>
                  <BodySmall
                    style={[styles.reviewerName, { color: textColor }]}
                  >
                    {reviewer.attributes.first_name}
                  </BodySmall>
                  <Caption style={{ color: Colors.neutral.gray[500] }}>
                    {formatShortDate(review.attributes.created_at, language)}
                  </Caption>
                </View>
              </>
            )}
          </View>

          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <IconSymbol
                key={index}
                name={index < review.attributes.rating ? 'star.fill' : 'star'}
                size={14}
                color={
                  index < review.attributes.rating
                    ? Colors.warning
                    : Colors.neutral.gray[300]
                }
              />
            ))}
          </View>
        </View>

        {review.attributes.text && (
          <BodySmall
            style={[styles.comment, { color: textColor }]}
            numberOfLines={4}
          >
            {review.attributes.text}
          </BodySmall>
        )}

        <Pressable
          style={styles.helpfulButton}
          onPress={() => onVote?.(review.id)}
          disabled={isVoting}
          accessibilityLabel="Mark review as helpful"
          accessibilityRole="button"
        >
          <IconSymbol
            name="hand.thumbsup"
            size={13}
            color={Colors.neutral.gray[500]}
          />
          <Caption style={{ color: Colors.neutral.gray[500] }}>
            {t('profile.helpful') || 'Helpful'} ({review.attributes.votes_count}
            )
          </Caption>
        </Pressable>
      </View>
    );
  }
);

ReviewCard.displayName = 'ReviewCard';

const styles = StyleSheet.create({
  card: {
    width: 280,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flex: 1,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerDetails: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  comment: {
    lineHeight: 20,
    fontSize: 14,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.neutral.gray[200],
  },
});
