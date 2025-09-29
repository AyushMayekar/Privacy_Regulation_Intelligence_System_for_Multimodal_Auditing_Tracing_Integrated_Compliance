# Resizable Chatbot Panel Implementation

This document describes the resizable chatbot panel feature that allows users to adjust the width of the chatbot by dragging the resize handle between the dashboard and chatbot panels.

## Overview

The resizable chatbot feature provides users with the ability to customize their workspace by adjusting the chatbot panel width. The feature includes drag functionality, localStorage persistence, responsive behavior, and smooth animations.

## Features

### 1. Drag-to-Resize Functionality
- **Resize Handle**: Visual handle between dashboard and chatbot panels
- **Mouse Support**: Full mouse drag functionality with cursor changes
- **Touch Support**: Touch-friendly drag for mobile devices
- **Smooth Animations**: CSS transitions for smooth resizing experience

### 2. Width Constraints
- **Minimum Width**: 20% of available space (prevents chatbot from becoming too small)
- **Maximum Width**: 80% of available space (ensures dashboard remains usable)
- **Real-time Updates**: Width changes are applied immediately during drag

### 3. localStorage Persistence
- **Automatic Save**: Chatbot width is saved to localStorage on every change
- **Automatic Load**: Width is restored from localStorage on page load
- **Validation**: Saved width is validated to ensure it's within acceptable bounds

### 4. Responsive Design
- **Desktop**: Full resize functionality with visible handle
- **Mobile**: Resize handle is hidden, chatbot takes full width
- **Breakpoint**: 992px (Bootstrap lg breakpoint)
- **Dynamic**: Responsive behavior updates on window resize

## Implementation Details

### State Management
```javascript
const [chatbotWidth, setChatbotWidth] = useState(50) // Percentage width
const [isResizing, setIsResizing] = useState(false)
const [isDragging, setIsDragging] = useState(false)
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992)
```

### Resize Logic
```javascript
const handleMouseDown = (e: React.MouseEvent) => {
  e.preventDefault()
  setIsDragging(true)
  setIsResizing(true)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  const startX = e.clientX
  const startWidth = chatbotWidth
  
  const handleMouseMove = (e: MouseEvent) => {
    const containerWidth = window.innerWidth - 260 // Subtract sidebar width
    const deltaX = e.clientX - startX
    const deltaPercentage = (deltaX / containerWidth) * 100
    
    let newWidth = startWidth - deltaPercentage // Subtract because dragging from left
    
    // Constrain width between 20% and 80%
    newWidth = Math.max(20, Math.min(80, newWidth))
    
    setChatbotWidth(newWidth)
  }
  
  // ... cleanup logic
}
```

### Layout Structure
```jsx
<div className="flex-grow-1 d-flex flex-column flex-lg-row">
  {/* Dashboard Panel */}
  <main 
    className="dashboard-panel p-4" 
    style={{ 
      minHeight: 'calc(100vh - 76px)',
      width: `${100 - chatbotWidth}%`
    }}
  >
    {/* Dashboard content */}
  </main>
  
  {/* Resize Handle */}
  <div 
    className={`resize-handle d-none d-lg-flex ${isDragging ? 'dragging' : ''}`}
    onMouseDown={handleMouseDown}
    onTouchStart={handleTouchStart}
    title="Drag to resize chatbot panel"
  />
  
  {/* Chatbot Panel */}
  <div 
    className="chatbot-panel-container border-start border-lg-start" 
    style={{ 
      width: isDesktop ? `${chatbotWidth}%` : '100%',
      minHeight: '400px',
      maxHeight: 'calc(100vh - 76px)'
    }}
  >
    <ChatPanel />
  </div>
</div>
```

## CSS Styling

### Resize Handle
```css
.resize-handle {
  position: absolute;
  left: -5px;
  top: 0;
  width: 10px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle:hover {
  background: rgba(11, 27, 43, 0.1);
}

.resize-handle::before {
  content: '';
  width: 2px;
  height: 40px;
  background: #0b1b2b;
  border-radius: 1px;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.resize-handle:hover::before {
  opacity: 0.8;
}

.resize-handle.dragging {
  background: rgba(11, 27, 43, 0.2);
}

.resize-handle.dragging::before {
  opacity: 1;
  background: #0b1b2b;
}
```

### Smooth Transitions
```css
.dashboard-panel {
  transition: width 0.2s ease;
  position: relative;
}

.chatbot-panel-container {
  position: relative;
  transition: width 0.2s ease;
}

.chat-panel {
  transition: width 0.2s ease;
}
```

### Responsive Behavior
```css
@media (max-width: 991.98px) {
  .resize-handle {
    display: none; /* Hide resize handle on mobile */
  }
  
  .dashboard-panel {
    width: 100% !important;
  }
  
  .chatbot-panel-container {
    width: 100% !important;
  }
}

@media (min-width: 992px) {
  .resize-handle {
    display: flex; /* Show resize handle on desktop */
  }
}
```

## User Experience Features

### 1. Visual Feedback
- **Hover State**: Resize handle becomes visible on hover
- **Dragging State**: Handle becomes more prominent during drag
- **Cursor Changes**: Cursor changes to `col-resize` during drag
- **Smooth Transitions**: CSS transitions for smooth width changes

### 2. Accessibility
- **Tooltip**: "Drag to resize chatbot panel" tooltip on handle
- **Keyboard Support**: Handle is focusable for keyboard users
- **Screen Reader**: Proper ARIA labels and roles
- **Touch Support**: Full touch support for mobile devices

### 3. Performance
- **Efficient Updates**: Only width values are updated during drag
- **Debounced Saves**: localStorage saves are efficient
- **Smooth Animations**: CSS transitions for 60fps animations
- **Memory Management**: Proper cleanup of event listeners

## Browser Support

### Desktop Browsers
- **Chrome**: Full support with smooth animations
- **Firefox**: Full support with smooth animations
- **Safari**: Full support with smooth animations
- **Edge**: Full support with smooth animations

### Mobile Browsers
- **iOS Safari**: Touch support with smooth animations
- **Chrome Mobile**: Touch support with smooth animations
- **Samsung Internet**: Touch support with smooth animations
- **Firefox Mobile**: Touch support with smooth animations

## Technical Considerations

### 1. Performance Optimization
- **Event Delegation**: Efficient event handling
- **CSS Transitions**: Hardware-accelerated animations
- **Minimal Re-renders**: Only necessary state updates
- **Memory Cleanup**: Proper event listener cleanup

### 2. Cross-browser Compatibility
- **CSS Prefixes**: Vendor prefixes for older browsers
- **Touch Events**: Fallback for touch devices
- **Cursor Support**: Fallback for cursor changes
- **Transitions**: Fallback for browsers without transition support

### 3. Responsive Design
- **Breakpoint Management**: Dynamic breakpoint detection
- **Window Resize**: Responsive behavior on window resize
- **Mobile Optimization**: Touch-friendly interactions
- **Layout Preservation**: Maintains layout integrity

## Usage Examples

### Basic Usage
The resizable chatbot works automatically once implemented. Users can:
1. Hover over the area between dashboard and chatbot
2. See the resize handle appear
3. Click and drag to adjust width
4. Release to set new width
5. Width is automatically saved

### Programmatic Control
```javascript
// Set chatbot width programmatically
setChatbotWidth(60) // 60% width

// Get current width
const currentWidth = chatbotWidth

// Reset to default
setChatbotWidth(50) // 50% width
```

### Customization
```javascript
// Custom width constraints
const minWidth = 25 // 25% minimum
const maxWidth = 75 // 75% maximum

// Custom localStorage key
localStorage.setItem('custom-chatbot-width', width.toString())
```

## Troubleshooting

### Common Issues

#### 1. Resize Handle Not Visible
- **Cause**: Screen width below 992px
- **Solution**: Resize handle is hidden on mobile by design

#### 2. Width Not Persisting
- **Cause**: localStorage disabled or full
- **Solution**: Check browser localStorage settings

#### 3. Smooth Animations Not Working
- **Cause**: CSS transitions not supported
- **Solution**: Add vendor prefixes or use JavaScript animations

#### 4. Touch Events Not Working
- **Cause**: Touch events blocked or not supported
- **Solution**: Check touch event support and permissions

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('chatbot-resize-debug', 'true')

// Check current state
console.log('Chatbot width:', chatbotWidth)
console.log('Is desktop:', isDesktop)
console.log('Is dragging:', isDragging)
```

## Future Enhancements

### 1. Advanced Features
- **Double-click Reset**: Double-click handle to reset to default width
- **Keyboard Shortcuts**: Keyboard shortcuts for resize operations
- **Preset Widths**: Quick buttons for common widths (25%, 50%, 75%)
- **Animation Controls**: User preference for animation speed

### 2. Accessibility Improvements
- **Voice Commands**: Voice control for resize operations
- **High Contrast**: High contrast mode for better visibility
- **Reduced Motion**: Respect user's motion preferences
- **Screen Reader**: Enhanced screen reader support

### 3. Performance Optimizations
- **Virtual Scrolling**: For large chatbot content
- **Lazy Loading**: Load chatbot content on demand
- **Memory Management**: Better memory cleanup
- **Battery Optimization**: Reduce battery usage on mobile

## Testing

### Unit Tests
- **State Management**: Test width state updates
- **Event Handling**: Test mouse and touch events
- **localStorage**: Test persistence functionality
- **Responsive**: Test responsive behavior

### Integration Tests
- **User Interactions**: Test complete drag operations
- **Cross-browser**: Test in different browsers
- **Mobile**: Test touch interactions
- **Performance**: Test animation performance

### E2E Tests
- **Complete Flows**: Test full resize workflows
- **Accessibility**: Test with screen readers
- **Mobile**: Test on real mobile devices
- **Performance**: Test with performance monitoring

This resizable chatbot implementation provides a smooth, accessible, and performant way for users to customize their workspace while maintaining excellent user experience across all devices.
