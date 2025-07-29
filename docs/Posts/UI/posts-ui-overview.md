# Posts UI System Overview

## Introduction

The Posts UI system provides a comprehensive set of React components for creating, displaying, and interacting with posts in the Bandsy social media platform. The system supports multiple content types including text, images, videos, audio samples, and media attachments.

## Architecture

### Component Structure

```
src/components/posts/
├── index.ts                    # Main exports
├── post-composer.tsx           # Post creation interface
├── media-upload.tsx            # File upload with drag & drop
├── audio-sample-selector.tsx   # Audio sample integration
├── mention-autocomplete.tsx    # @mention functionality
├── post-card.tsx              # Individual post display
├── post-feed.tsx              # Feed with infinite scroll
├── comment-thread.tsx         # Comment system
└── share-modal.tsx            # Post sharing interface
```

### Key Features

- **Multi-modal Content**: Support for text, images, videos, audio, and media samples
- **Polymorphic Authorship**: Posts can be created by users or groups
- **Rich Interactions**: Likes, comments, shares, bookmarks, and @mentions
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Mobile-First Design**: Responsive components for all screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support

## Core Components

### PostComposer

The main post creation interface with rich text editing capabilities.

**Key Features:**
- Character limits (500 for regular users, 2000 for premium)
- Real-time character counting
- Post as user or group
- Visibility controls (public, followers only, private)
- Media upload integration
- Audio sample selection
- @mention autocomplete
- Drag & drop file upload

**Usage:**
```tsx
import { PostComposer } from "@/components/posts";

<PostComposer
  currentUser={currentUser}
  userGroups={userGroups}
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
/>
```

### PostCard

Individual post display component with full interaction support.

**Key Features:**
- Responsive layout for all content types
- Engagement metrics (likes, comments, shares)
- Media previews and playback
- Action menus (edit, delete, report)
- Time formatting and author information
- Accessibility features

**Usage:**
```tsx
import { PostCard } from "@/components/posts";

<PostCard
  post={post}
  onLike={handleLike}
  onUnlike={handleUnlike}
  onComment={handleComment}
  onShare={handleShare}
  onBookmark={handleBookmark}
/>
```

### PostFeed

Feed component with infinite scroll and loading states.

**Key Features:**
- Infinite scroll pagination
- Multiple feed types (home, user, group, trending)
- Pull-to-refresh functionality
- Empty state handling
- Loading indicators
- Error handling

**Usage:**
```tsx
import { PostFeed } from "@/components/posts";

<PostFeed
  feedType="home"
  showCreatePost={true}
  className="max-w-2xl mx-auto"
/>
```

### MediaUpload

Advanced file upload component with drag & drop support.

**Key Features:**
- Drag & drop interface
- File type validation
- Size limits by content type
- Upload progress indicators
- Preview generation
- Error handling

**Supported File Types:**
- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Videos**: MP4, WebM (max 100MB)
- **Audio**: MP3, WAV, OGG (max 50MB)

**Usage:**
```tsx
import { MediaUpload } from "@/components/posts";

<MediaUpload
  onFilesChange={handleFilesChange}
  maxFiles={5}
  acceptedTypes={["image/*", "video/*"]}
/>
```

### AudioSampleSelector

Integration component for selecting audio samples from the user's library.

**Key Features:**
- Audio sample browser
- Search and filter functionality
- Inline audio playback
- Sample metadata display
- Integration with media samples system

**Usage:**
```tsx
import { AudioSampleSelector } from "@/components/posts";

<AudioSampleSelector
  onSampleSelect={handleSampleSelect}
  onSampleRemove={handleSampleRemove}
  userSamples={userSamples}
  selectedSample={selectedSample}
/>
```

### MentionAutocomplete

@mention functionality with user and group search.

**Key Features:**
- Real-time search as you type
- User and group suggestions
- Keyboard navigation
- Position-aware popup placement
- Mention highlighting

**Usage:**
```tsx
import { MentionAutocomplete, useMentions } from "@/components/posts";

const { mentions, addMention } = useMentions();

<MentionAutocomplete
  query={mentionQuery}
  onSelect={handleMentionSelect}
  onClose={handleMentionClose}
  position={{ top: 100, left: 50 }}
  visible={showMentions}
/>
```

### CommentThread

Complete comment system with nested replies.

**Key Features:**
- Nested comment threads
- Reply functionality
- Comment editing and deletion
- Like/unlike comments
- Real-time updates
- Pagination for long threads

**Usage:**
```tsx
import { CommentThread } from "@/components/posts";

<CommentThread
  postId={postId}
  comments={comments}
  onAddComment={handleAddComment}
  onEditComment={handleEditComment}
  onDeleteComment={handleDeleteComment}
  onLikeComment={handleLikeComment}
  currentUser={currentUser}
/>
```

### ShareModal

Post sharing interface with multiple sharing options.

**Key Features:**
- Repost functionality
- Quote posts with comments
- External sharing (Twitter, Facebook, email)
- Link copying
- Share preview

**Usage:**
```tsx
import { ShareModal } from "@/components/posts";

<ShareModal
  post={post}
  isOpen={isShareModalOpen}
  onClose={handleCloseShareModal}
  onShare={handleShare}
  currentUser={currentUser}
/>
```

## Styling and Theming

### Design System

The components use a consistent design system with:
- **Typography**: Tailwind CSS typography classes
- **Colors**: Semantic color tokens (primary, secondary, muted, etc.)
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and micro-interactions
- **Dark Mode**: Full dark mode support

### Responsive Design

All components are mobile-first and responsive:
- **Mobile**: Optimized for touch interactions
- **Tablet**: Adapted layouts for medium screens
- **Desktop**: Full-featured desktop experience

### Accessibility

Components include comprehensive accessibility features:
- **Screen Reader**: ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG AA compliance

## State Management

### Optimistic Updates

The UI uses optimistic updates for instant feedback:
- Like/unlike actions
- Comment submissions
- Bookmark toggles
- Share actions

### Loading States

Comprehensive loading states throughout:
- Initial loading skeletons
- Button loading indicators
- Infinite scroll loading
- Form submission states

### Error Handling

Graceful error handling with:
- User-friendly error messages
- Retry mechanisms
- Fallback UI states
- Network error handling

## Performance Considerations

### Code Splitting

Components are designed for code splitting:
- Lazy loading for modal components
- Dynamic imports for heavy features
- Tree-shaking friendly exports

### Optimization

Performance optimizations include:
- React.memo for expensive components
- useMemo for complex calculations
- useCallback for event handlers
- Intersection Observer for infinite scroll

### Media Handling

Efficient media handling:
- Lazy loading for images
- Progressive image loading
- Video thumbnail generation
- Audio waveform visualization

## Integration Points

### Backend API

Components integrate with the backend API:
- RESTful endpoints for CRUD operations
- Real-time updates via Server-Sent Events
- File upload handling
- Authentication integration

### Database Schema

Direct integration with the database schema:
- Post creation and updates
- Interaction tracking
- Media attachments
- User and group relationships

### External Services

Integration with external services:
- Cloud storage for media files
- Content delivery network (CDN)
- Social media sharing APIs
- Analytics tracking

## Usage Guidelines

### Best Practices

1. **Component Composition**: Use components together for complete features
2. **State Management**: Keep state close to where it's used
3. **Error Boundaries**: Wrap components in error boundaries
4. **Loading States**: Always provide loading feedback
5. **Accessibility**: Test with screen readers and keyboard navigation

### Common Patterns

```tsx
// Complete post creation flow
const PostCreationFlow = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedSample, setSelectedSample] = useState<AudioSample | null>(null);

  const handleSubmit = async (postData: PostData) => {
    setIsSubmitting(true);
    try {
      await createPost(postData);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PostComposer
      currentUser={currentUser}
      userGroups={userGroups}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
};
```

## Migration Guide

### From Legacy System

If migrating from a legacy post system:

1. **Data Migration**: Ensure all existing posts are properly migrated
2. **Component Replacement**: Replace old components gradually
3. **State Updates**: Update state management patterns
4. **API Integration**: Migrate to new API endpoints
5. **Testing**: Comprehensive testing of all interactions

### Breaking Changes

Major version updates may include:
- Component API changes
- Prop modifications
- State structure updates
- Styling changes

## Testing

### Unit Testing

All components include comprehensive unit tests:
- Rendering tests
- Interaction tests
- State management tests
- Error handling tests

### Integration Testing

End-to-end testing covers:
- Complete user flows
- API integration
- Cross-component interactions
- Performance testing

### Accessibility Testing

Automated accessibility testing:
- WCAG compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation

## Troubleshooting

### Common Issues

1. **File Upload Failures**: Check file size limits and network connection
2. **Loading States**: Ensure proper loading state management
3. **Performance Issues**: Monitor component re-renders
4. **Accessibility**: Test with assistive technologies

### Debug Tools

Development tools for debugging:
- React DevTools
- Performance profiler
- Network monitoring
- Console logging

## Future Enhancements

### Planned Features

- **Rich Text Editor**: Advanced formatting options
- **Video Processing**: Automatic video compression
- **AI Integration**: Smart content suggestions
- **Analytics**: Detailed engagement metrics
- **Collaboration**: Real-time collaborative editing

### Technical Improvements

- **WebRTC**: Real-time media streaming
- **WebAssembly**: Performance-critical operations
- **Service Workers**: Offline functionality
- **Progressive Web App**: Enhanced mobile experience

## Support

For technical support and questions:
- **Documentation**: Comprehensive component documentation
- **Examples**: Working code examples
- **Community**: Developer community forums
- **Issue Tracking**: GitHub issues for bug reports

---

This UI system provides a solid foundation for social media post functionality with room for future enhancements and customization.