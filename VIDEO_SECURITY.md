# Video Security Implementation

This document outlines the security measures implemented to prevent students from downloading course videos while allowing them to stream and watch the content.

## Security Measures Implemented

### 1. Backend Security

#### File Controller (`backend/src/controllers/file.controller.ts`)
- **Role-based headers**: Different headers for students vs teachers/admins
- **Content-Disposition**: Students get `inline` (streaming only), teachers get `attachment` (can download)
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options` for students

#### Video Access Middleware (`backend/src/middleware/videoAccess.ts`)
- **Authentication verification**: Validates JWT tokens
- **Enrollment check**: Ensures students are enrolled in the course
- **Permission hierarchy**: Teacher > Admin > Enrolled Student

#### Video Security Middleware (`backend/src/middleware/videoSecurity.ts`)
- **Hotlinking prevention**: Checks referer and origin headers
- **Rate limiting**: 30 video requests per minute per IP
- **Security headers**: Comprehensive XSS and clickjacking protection
- **CORS restrictions**: Only allows approved origins

#### Route Protection (`backend/src/routes/file.routes.ts`)
- **Middleware chain**: Rate limit → Security headers → Access control → Serve video
- **Comprehensive protection**: Multiple layers of security

### 2. Frontend Security

#### Video Player Component (`src/components/ui/VideoPlayer.tsx`)
- **HTML5 attributes**: `controlsList="nodownload"`, `disablePictureInPicture`
- **Event prevention**: `onContextMenu`, `onDragStart` handlers
- **Security wrapper**: Uses `VideoSecurityMonitor` component

#### CSS Protection (`src/components/ui/VideoProtection.css`)
- **User selection prevention**: `-webkit-user-select: none`
- **Control hiding**: Hides download buttons in WebKit browsers
- **Mobile protection**: Touch event prevention for mobile devices

#### Security Monitor (`src/components/ui/VideoSecurityMonitor.tsx`)
- **Keyboard shortcuts**: Blocks Ctrl+S, F12, dev tools shortcuts
- **Context menu prevention**: Disables right-click on video elements
- **Text selection prevention**: Global text selection blocking
- **Dev tools detection**: Monitors for developer tools opening

## Access Control Logic

### Students
- ✅ Can stream videos online
- ❌ Cannot download videos
- ❌ Cannot use right-click menu
- ❌ Cannot use keyboard shortcuts for download
- ❌ Cannot access video URLs directly without authentication

### Teachers
- ✅ Can stream videos online
- ✅ Can download videos
- ✅ Full access to course content

### Admins
- ✅ Can stream videos online
- ✅ Can download videos
- ✅ Full access to all content

## Technical Implementation Details

### Authentication Flow
1. Client requests video with JWT token
2. Middleware validates token and user role
3. System checks course enrollment (for students)
4. Security headers are applied based on user role
5. Video is served with appropriate restrictions

### Security Headers for Students
```http
Content-Type: video/mp4
Content-Disposition: inline
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: private, no-cache, no-store, must-revalidate
```

### Security Headers for Teachers/Admins
```http
Content-Type: video/mp4
Content-Disposition: attachment; filename="video.mp4"
Cache-Control: private, max-age=3600
```

## Limitations and Considerations

### What This Prevents
- Direct video downloads via browser controls
- Right-click context menu downloads
- Keyboard shortcut downloads
- Hotlinking from unauthorized domains
- Direct URL access without authentication
- Basic screen recording tools

### What This Doesn't Prevent
- Screen recording software (OBS, etc.)
- Browser extensions that capture video
- Mobile device screen recording
- Physical recording (camera filming screen)

## Testing the Implementation

### To verify student restrictions:
1. Log in as a student enrolled in a course
2. Navigate to a course video
3. Try right-clicking on the video → Should be blocked
4. Try Ctrl+S → Should be blocked
5. Check video controls → Download button should be hidden
6. Try accessing video URL directly in new tab → Should require authentication

### To verify teacher permissions:
1. Log in as a teacher
2. Navigate to your course video
3. Right-click should work normally
4. Download should be available in video controls

## Maintenance

### Regular Security Reviews
- Monitor for new browser bypass methods
- Update security headers as needed
- Review rate limiting thresholds
- Check for new hotlinking attempts

### Performance Considerations
- Rate limiting prevents abuse
- Caching is limited for security
- Additional middleware adds minimal latency

## Future Enhancements

### Possible Improvements
- Watermarking videos with student information
- Implementing DRM (Digital Rights Management)
- Adding video analytics to detect unusual access patterns
- Implementing time-limited access tokens
- Adding geographic restrictions if needed

### Monitoring and Alerts
- Log all video access attempts
- Alert on suspicious download attempts
- Monitor rate limit violations
- Track unauthorized access attempts
