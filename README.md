# Antonio Alcántara Mata - Academic Website

A modern, responsive single-page academic website built from scratch without using GitHub templates.

## Features

- **Modern Design**: Clean, professional layout with smooth animations
- **Fully Responsive**: Mobile-first design that works on all devices
- **Interactive Elements**: Smooth scrolling, hover effects, and dynamic navigation
- **Performance Optimized**: Fast loading with optimized CSS and JavaScript
- **Accessible**: Proper semantic HTML and accessibility features
- **SEO Ready**: Meta tags and structured content for search engines

## Sections

1. **Hero/Home** - Introduction and main call-to-action
2. **About** - Academic background and research interests
3. **Research** - Current research projects and areas of focus
4. **Publications** - Academic publications and CV download
5. **Teaching** - Teaching experience and courses
6. **Contact** - Contact information and contact form

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

## Setup Instructions

1. **Clone or download** this repository
2. **Add your profile image** to `images/profile.jpg`
3. **Add your CV** to `cv/antonio_alcantara_cv.pdf`
4. **Customize content** in `index.html`:
   - Update personal information
   - Modify research interests
   - Add your publications
   - Update teaching experience
   - Add your social media links
5. **Open `index.html`** in a web browser

## Customization

### Content Updates
- Edit `index.html` to update text content, links, and personal information
- Replace placeholder publications with your actual research
- Update social media links in the hero section
- Modify contact information

### Visual Customization
- **Colors**: Update the CSS custom properties in `styles.css`
- **Fonts**: Change font imports in the HTML head section
- **Layout**: Modify grid and flexbox layouts in CSS
- **Animations**: Adjust or add new animations in `script.js`

### Key Color Variables (in CSS)
```css
:root {
  --primary-color: #2c5aa0;
  --secondary-color: #1e3d72;
  --background-color: #f8f9fa;
  --text-color: #333;
}
```

## File Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
├── images/             # Image assets
│   ├── profile.jpg     # Your profile photo
│   └── README.md       # Image directory info
├── cv/                 # CV and documents
│   ├── antonio_alcantara_cv.pdf
│   └── README.md       # CV directory info
└── README.md           # This file
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Features

- **Optimized CSS** with efficient selectors
- **Throttled scroll events** for smooth performance
- **Lazy loading** preparation for images
- **Minimal JavaScript** with efficient event handling
- **Progressive enhancement** approach

## Accessibility Features

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators
- Alt text for images

## SEO Features

- Meta tags for search engines
- Structured data preparation
- Semantic HTML markup
- Fast loading times
- Mobile-friendly design

## Contact Form

The contact form currently shows a success message locally. To make it functional:

1. **Backend Integration**: Connect to a backend service (Node.js, PHP, etc.)
2. **Email Service**: Use services like EmailJS, Formspree, or Netlify Forms
3. **Validation**: Server-side validation for security

## Deployment Options

### GitHub Pages
1. Create a new repository
2. Upload files
3. Enable GitHub Pages in settings
4. Your site will be available at `username.github.io/repository-name`

### Netlify
1. Drag and drop the folder to Netlify
2. Get instant deployment with custom domain support

### Vercel
1. Connect your GitHub repository
2. Automatic deployments on push

### Traditional Web Hosting
1. Upload files via FTP
2. Point domain to the directory

## Future Enhancements

- Blog section integration
- Dark mode toggle
- Multi-language support
- PWA features
- Advanced contact form with backend
- Publication search and filtering
- Research project galleries

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- **Design**: Custom design inspired by modern academic websites
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Animations**: Custom CSS and JavaScript

---

*Built with ❤️ for academic excellence*
