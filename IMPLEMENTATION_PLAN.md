# ResearchMate Mobile App - Implementation Plan

## Mobile-Exclusive Features Roadmap

### Phase 5: Mobile Hardware Features

---

## 1. 📷 Camera Scanner with OCR

**Priority:** HIGH | **Effort:** Medium

### Dependencies

```bash
npx expo install expo-camera expo-image-picker
# For OCR: Use Google Cloud Vision API or expo-ocr
```

### Files to Create

- `src/screens/main/CameraScannerScreen.tsx` - Camera UI
- `src/services/ocrService.ts` - OCR API integration
- `src/components/scanner/ScanPreview.tsx` - Preview captured image

### Flow

1. User opens Camera Scanner
2. Take photo of document/book/notes
3. Send to OCR service (Google Vision API)
4. Extract text → Create research item
5. Auto-generate tags with AI

---

## 2. 🎤 Voice Notes

**Priority:** HIGH | **Effort:** Medium

### Dependencies

```bash
npx expo install expo-av
# Backend: Google Cloud Speech-to-Text or OpenAI Whisper
```

### Files to Create

- `src/screens/main/VoiceNotesScreen.tsx` - Recording UI
- `src/services/speechService.ts` - Speech-to-text API
- `src/components/voice/RecordButton.tsx` - Record controls

### Flow

1. User taps record button
2. Record audio with expo-av
3. Send to speech-to-text API
4. Create research item with transcription
5. Optionally keep audio attachment

---

## 3. 🔔 Smart Reminders

**Priority:** MEDIUM | **Effort:** Low

### Dependencies

```bash
npx expo install expo-notifications
```

### Files to Create

- `src/services/reminderService.ts` - Schedule notifications
- Update `ResearchItemModal.tsx` - Add "Remind Me" button

### Flow

1. User views research item
2. Taps "Remind Me" → Select time (1h, 1d, 3d, 1w)
3. Schedule local push notification
4. Notification opens item directly

---

## 4. 📍 Location Tagging

**Priority:** LOW | **Effort:** Low

### Dependencies

```bash
npx expo install expo-location
```

### Changes

- Update `storageService.ts` - Add location field
- Auto-capture location when saving items
- Add location filter in Statistics

---

## Implementation Order

1. **Smart Reminders** - Easiest, high impact
2. **Location Tagging** - Simple addition
3. **Camera Scanner** - Requires API setup
4. **Voice Notes** - Requires backend proxy

---

## API Keys Needed

- [ ] Google Cloud Vision API (for OCR)
- [ ] Google Cloud Speech-to-Text or OpenAI API (for voice)

## Notes

- All features work in Expo Go except Share Sheet
- OCR and Voice require internet connectivity
- Push notifications need physical device testing
