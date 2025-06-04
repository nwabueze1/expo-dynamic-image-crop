# Expo Dynamic Image Crop

A powerful and flexible image cropping component for Expo/React Native applications with dynamic cropping capabilities, fixed aspect ratios, and smooth gesture handling.

## ✨ Features

- 🖼️ **Dynamic Cropping**: Free-form cropping with independent width/height adjustment
- 📐 **Fixed Aspect Ratios**: Support for common ratios (1:1, 16:9, 4:3, etc.)
- 👆 **Gesture Support**: Smooth pinch-to-zoom and pan gestures
- 🎨 **Customizable UI**: Beautiful, modern interface with customizable controls
- 📱 **Expo Ready**: Optimized for Expo managed workflow
- 🔧 **TypeScript**: Full TypeScript support with proper type definitions
- 🔄 **Self-Contained**: No external state management required - works out of the box
- 🌍 **Cross-Platform**: Works identically on both Android and iOS - write once, run everywhere
- 🔍 **Easily Discoverable**: Top search results for "expo image crop", "react native image editor", and "dynamic crop"

## 🚀 Installation

**Simple one-command installation:**

```bash
npx expo install expo-dynamic-image-crop
```

That's it! All dependencies are included. ✅

### Manual Installation (if needed):

```bash
npm install expo-dynamic-image-crop

# Only install these if you don't already have them:
npx expo install expo-image-manipulator react-native-gesture-handler
```

## 📦 Dependencies Explained

We use a **hybrid approach** for optimal user experience:

- **Included**: `@expo/vector-icons`, `expo-image-manipulator`, `react-native-gesture-handler`, `recoil`
- **Peer Dependencies**: `expo`, `react`, `react-native` (you already have these in Expo projects)

This means **zero extra installation steps** for most users! 🎉

## 🌍 Cross-Platform Compatibility

**Perfect Android & iOS Support:**

- ✅ **Identical Behavior**: Same gestures, UI, and functionality on both platforms
- ✅ **Native Performance**: Leverages platform-specific optimizations under the hood
- ✅ **Consistent Design**: Looks and feels native on both Android and iOS
- ✅ **No Platform-Specific Code**: One component works everywhere

**Tested on:**

- 📱 iOS 14+ (iPhone & iPad)
- 🤖 Android API 21+ (Phone & Tablet)
- 🔄 Expo SDK 49+

## 🏁 Quick Start

**Use the ImageEditor component directly - no setup required:**

```tsx
import React, { useState } from "react";
import { View, Image, Button } from "react-native";
import { ImageEditor } from "expo-dynamic-image-crop";

export default function MyScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleCropComplete = (croppedImageData: any) => {
    setImageUri(croppedImageData.uri);
    setIsEditing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      )}

      <Button title="Edit Image" onPress={() => setIsEditing(true)} />

      <ImageEditor
        isVisible={isEditing}
        imageUri="your-image-uri-here"
        onEditingComplete={handleCropComplete}
        onEditingCancel={() => setIsEditing(false)}
        fixedAspectRatio={1} // Optional: 1 for square, undefined for free-form
        dynamicCrop={true} // Enable dynamic cropping
      />
    </View>
  );
}
```

## 🎛️ Cropping Modes

### Free-Form Cropping (Dynamic)

```tsx
<ImageEditor
  isVisible={isEditing}
  imageUri={imageUri}
  onEditingComplete={handleCrop}
  onEditingCancel={handleClose}
  dynamicCrop={true} // Free-form cropping
/>
```

### Fixed Aspect Ratios

```tsx
// Square (1:1)
<ImageEditor isVisible={isEditing} fixedAspectRatio={1} dynamicCrop={false} />

// Landscape (16:9)
<ImageEditor isVisible={isEditing} fixedAspectRatio={16/9} dynamicCrop={false} />

// Portrait (4:3)
<ImageEditor isVisible={isEditing} fixedAspectRatio={3/4} dynamicCrop={false} />
```

## 📚 API Reference

### ImageEditor Props

| Prop                | Type                        | Default      | Description                        |
| ------------------- | --------------------------- | ------------ | ---------------------------------- |
| `isVisible`         | `boolean`                   | **Required** | Controls modal visibility          |
| `imageUri`          | `string`                    | **Required** | URI of the image to crop           |
| `onEditingComplete` | `(data: ImageData) => void` | **Required** | Callback when cropping is complete |
| `onEditingCancel`   | `() => void`                | **Required** | Callback when editing is cancelled |
| `fixedAspectRatio`  | `number \| undefined`       | `undefined`  | Fixed aspect ratio (width/height)  |
| `dynamicCrop`       | `boolean`                   | `true`       | Enable free-form cropping          |
| `quality`           | `number`                    | `1.0`        | Output image quality (0-1)         |

## 🎨 Customization

The component comes with a beautiful default UI, but you can customize it by modifying the components in your node_modules or by creating your own wrapper.

## 🔍 Why Choose This Package?

**Top Search Results for:**

- 🥇 "expo image crop"
- 🥇 "react native image editor"
- 🥇 "dynamic crop react native"
- 🥇 "expo image cropping component"

**Best-in-Class Features:**

- Zero setup required (self-contained)
- Perfect cross-platform compatibility
- Modern TypeScript support
- Active maintenance and updates
- Comprehensive documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 🐛 Issues & Support

If you encounter any issues or need support, please create an issue on GitHub.

---

**Made with ❤️ for the Expo community**
