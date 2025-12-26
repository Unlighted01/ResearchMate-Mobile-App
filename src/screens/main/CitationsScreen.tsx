// ============================================
// CITATIONS SCREEN - Smart Citation Extractor
// Ports website's AICitationExtractor logic to mobile
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { colors } from "../../constants/colors";

// ============================================
// PART 2: TYPE DEFINITIONS
// ============================================

type DetectedType = "url" | "doi" | "isbn" | "youtube" | "unknown";
type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard" | "IEEE";

interface Metadata {
  title: string;
  author: string;
  authors?: string[];
  publishDate: string;
  publishYear?: string;
  accessDate: string;
  siteName: string;
  url: string;
  doi?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  publisher?: string;
  isbn?: string;
  channelTitle?: string;
}

// ============================================
// PART 3: API CONFIG
// ============================================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://researchmate.vercel.app";

// ============================================
// PART 4: INPUT DETECTION (from website)
// ============================================

function detectInputType(input: string): { type: DetectedType; value: string } {
  const trimmed = input.trim();

  // Check ISBN (10 or 13 digits, with optional dashes)
  const cleanedForISBN = trimmed.replace(/[-\s]/g, "");
  if (
    /^\d{10}$/.test(cleanedForISBN) ||
    /^97[89]\d{10}$/.test(cleanedForISBN)
  ) {
    return { type: "isbn", value: cleanedForISBN };
  }

  // Check DOI (starts with 10.)
  const doiCleaned = trimmed
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim();
  if (/^10\.\d{4,}\/\S+$/.test(doiCleaned)) {
    return { type: "doi", value: doiCleaned };
  }

  // Check YouTube
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of ytPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return { type: "youtube", value: match[1] };
    }
  }

  // Check if it's a URL
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.includes(".")
  ) {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return { type: "url", value: url };
  }

  return { type: "unknown", value: trimmed };
}

function getTypeLabel(type: DetectedType): { icon: string; label: string } {
  const types = {
    url: { icon: "🌐", label: "Website" },
    doi: { icon: "📄", label: "Academic Paper (DOI)" },
    isbn: { icon: "📚", label: "Book (ISBN)" },
    youtube: { icon: "📺", label: "YouTube Video" },
    unknown: { icon: "❓", label: "Unknown" },
  };
  return types[type];
}

// ============================================
// PART 5: CITATION FORMATTERS
// ============================================

function formatCitation(
  metadata: Metadata,
  style: CitationStyle,
  type: DetectedType
): string {
  const author = metadata.author || "Unknown Author";
  const year =
    metadata.publishYear ||
    (metadata.publishDate
      ? new Date(metadata.publishDate).getFullYear()
      : "n.d.");
  const title = metadata.title || "Untitled";
  const accessDate = new Date(metadata.accessDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  switch (style) {
    case "APA":
      if (type === "isbn") {
        return `${author}. (${year}). ${title}. ${
          metadata.publisher || "Publisher"
        }.`;
      }
      if (type === "doi") {
        const journal = metadata.journal ? ` ${metadata.journal}` : "";
        const vol = metadata.volume ? `, ${metadata.volume}` : "";
        const iss = metadata.issue ? `(${metadata.issue})` : "";
        const doi = metadata.doi ? ` https://doi.org/${metadata.doi}` : "";
        return `${author}. (${year}). ${title}.${journal}${vol}${iss}.${doi}`;
      }
      if (type === "youtube") {
        return `${
          metadata.channelTitle || author
        }. (${year}). ${title} [Video]. YouTube. ${metadata.url}`;
      }
      return `${author}. (${year}). ${title}. ${
        metadata.siteName || "Website"
      }. Retrieved ${accessDate}, from ${metadata.url}`;

    case "MLA":
      if (type === "isbn") {
        return `${author}. ${title}. ${
          metadata.publisher || "Publisher"
        }, ${year}.`;
      }
      if (type === "doi") {
        return `${author}. "${title}." ${metadata.journal || ""}, vol. ${
          metadata.volume || "?"
        }, no. ${metadata.issue || "?"}, ${year}.`;
      }
      return `"${title}." ${metadata.siteName || "Website"}, ${year}, ${
        metadata.url
      }. Accessed ${accessDate}.`;

    case "Chicago":
      if (type === "isbn") {
        return `${author}. ${title}. ${
          metadata.publisher || "Publisher"
        }, ${year}.`;
      }
      return `${author}. "${title}." ${
        metadata.siteName || "Website"
      }. ${year}. ${metadata.url}.`;

    case "Harvard":
      return `${author} (${year}) '${title}', ${
        metadata.siteName || "Website"
      }. Available at: ${metadata.url} (Accessed: ${accessDate}).`;

    case "IEEE":
      return `${author}, "${title}," ${
        metadata.siteName || "Website"
      }, ${year}. [Online]. Available: ${
        metadata.url
      }. [Accessed: ${accessDate}].`;

    default:
      return `${author}. "${title}." ${
        metadata.siteName || "Website"
      }, ${year}. ${metadata.url}`;
  }
}

// ============================================
// PART 6: MAIN COMPONENT
// ============================================

export default function CitationsScreen() {
  // ---------- STATE ----------
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [detectedType, setDetectedType] = useState<DetectedType | null>(null);
  const [liveType, setLiveType] = useState<DetectedType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>("APA");
  const [error, setError] = useState<string | null>(null);

  const styles_list: CitationStyle[] = [
    "APA",
    "MLA",
    "Chicago",
    "Harvard",
    "IEEE",
  ];

  // Live detection as user types
  useEffect(() => {
    if (input.trim().length > 3) {
      const { type } = detectInputType(input);
      setLiveType(type);
    } else {
      setLiveType(null);
    }
  }, [input]);

  // ---------- API CALLS (using free public APIs directly) ----------

  // Safe fetch with JSON parsing
  const safeFetch = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      console.log("Non-JSON response:", text.slice(0, 200));
      throw new Error("API returned invalid response");
    }
  };

  const extractDOI = async (doi: string): Promise<Metadata> => {
    // Use CrossRef API directly (free, no auth needed)
    const data = await safeFetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}`
    );

    if (!data.message) throw new Error("DOI not found");

    const work = data.message;
    const authors =
      work.author?.map((a: any) =>
        `${a.given || ""} ${a.family || ""}`.trim()
      ) || [];
    const year = work.published?.["date-parts"]?.[0]?.[0];

    return {
      title: Array.isArray(work.title)
        ? work.title[0]
        : work.title || "Untitled",
      author: authors.join(", ") || "Unknown Author",
      authors,
      publishDate: year ? `${year}-01-01` : "",
      publishYear: year?.toString(),
      accessDate: new Date().toISOString(),
      siteName:
        work["container-title"]?.[0] ||
        work.publisher ||
        "Academic Publication",
      url: `https://doi.org/${doi}`,
      journal: work["container-title"]?.[0],
      volume: work.volume,
      issue: work.issue,
      doi: doi,
      publisher: work.publisher,
    };
  };

  const extractISBN = async (isbn: string): Promise<Metadata> => {
    // Use Open Library API directly (free, no auth needed)
    const data = await safeFetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );

    const book = data[`ISBN:${isbn}`];
    if (!book) throw new Error("ISBN not found");

    const authors = book.authors?.map((a: any) => a.name) || [];
    const year = book.publish_date?.match(/\d{4}/)?.[0];

    return {
      title: book.title || "Untitled",
      author: authors.join(", ") || "Unknown Author",
      authors,
      publishDate: year ? `${year}-01-01` : "",
      publishYear: year,
      accessDate: new Date().toISOString(),
      siteName: book.publishers?.[0]?.name || "Publisher",
      url: book.url || `https://openlibrary.org/isbn/${isbn}`,
      publisher: book.publishers?.[0]?.name,
      isbn: isbn,
    };
  };

  const extractYouTube = async (videoId: string): Promise<Metadata> => {
    // Use noembed.com (free, no auth needed) for basic YouTube info
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const data = await safeFetch(
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`
    );

    if (data.error) throw new Error("YouTube video not found");

    return {
      title: data.title || "Untitled Video",
      author: data.author_name || "Unknown Channel",
      publishDate: "",
      accessDate: new Date().toISOString(),
      siteName: "YouTube",
      url: url,
      channelTitle: data.author_name,
    };
  };

  const extractURL = async (url: string): Promise<Metadata> => {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    const pathname = urlObj.pathname;

    // Check for IEEE paper URL
    const ieeeMatch = pathname.match(/document\/(\d+)/);
    if (hostname.includes("ieee") && ieeeMatch) {
      const docId = ieeeMatch[1];
      // Search Semantic Scholar for IEEE paper
      try {
        const ssData = await safeFetch(
          `https://api.semanticscholar.org/graph/v1/paper/search?query=ieee+${docId}&limit=1&fields=title,authors,year,venue,externalIds`
        );
        if (ssData.data?.[0]) {
          const paper = ssData.data[0];
          const authors = paper.authors?.map((a: any) => a.name) || [];
          return {
            title: paper.title || "Untitled",
            author: authors.join(", ") || "Unknown Author",
            authors,
            publishDate: paper.year ? `${paper.year}-01-01` : "",
            publishYear: paper.year?.toString(),
            accessDate: new Date().toISOString(),
            siteName: paper.venue || "IEEE",
            url: url,
            doi: paper.externalIds?.DOI,
          };
        }
      } catch (e) {
        console.log("Semantic Scholar lookup failed, trying OpenAlex");
      }

      // Fallback: Search OpenAlex
      try {
        const oaData = await safeFetch(
          `https://api.openalex.org/works?search=${docId}&filter=institutions.country_code:US&per_page=1`
        );
        if (oaData.results?.[0]) {
          const work = oaData.results[0];
          const authors =
            work.authorships
              ?.map((a: any) => a.author?.display_name)
              .filter(Boolean) || [];
          return {
            title: work.title || "Untitled",
            author: authors.join(", ") || "Unknown Author",
            authors,
            publishDate: work.publication_date || "",
            publishYear: work.publication_year?.toString(),
            accessDate: new Date().toISOString(),
            siteName: work.primary_location?.source?.display_name || "IEEE",
            url: url,
            doi: work.doi?.replace("https://doi.org/", ""),
          };
        }
      } catch (e) {
        console.log("OpenAlex lookup also failed");
      }
    }

    // Check for arXiv
    const arxivMatch = pathname.match(/abs\/(\d+\.\d+)/);
    if (hostname.includes("arxiv") && arxivMatch) {
      const arxivId = arxivMatch[1];
      try {
        const doi = `10.48550/arXiv.${arxivId}`;
        return await extractDOI(doi);
      } catch (e) {
        console.log("arXiv DOI lookup failed");
      }
    }

    // Check for Nature
    const natureMatch = pathname.match(/articles\/([a-z0-9-]+)/i);
    if (hostname.includes("nature") && natureMatch) {
      try {
        const doi = `10.1038/${natureMatch[1]}`;
        return await extractDOI(doi);
      } catch (e) {
        console.log("Nature DOI lookup failed");
      }
    }

    // Check for Springer
    const springerMatch = pathname.match(
      /(?:article|chapter)\/(10\.\d+\/[^?#]+)/i
    );
    if (hostname.includes("springer") && springerMatch) {
      try {
        return await extractDOI(decodeURIComponent(springerMatch[1]));
      } catch (e) {
        console.log("Springer DOI lookup failed");
      }
    }

    // Default: basic URL extraction
    const pathParts = pathname.split("/").filter(Boolean);
    let title = "Untitled Page";
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      title = lastPart
        .replace(/[-_]/g, " ")
        .replace(/\.\w+$/, "")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    return {
      title,
      author:
        hostname.split(".")[0].charAt(0).toUpperCase() +
        hostname.split(".")[0].slice(1),
      publishDate: "",
      accessDate: new Date().toISOString(),
      siteName: hostname,
      url,
    };
  };

  // ---------- HANDLERS ----------
  const handleExtract = async () => {
    if (!input.trim()) {
      Alert.alert("Error", "Please enter a URL, DOI, ISBN, or YouTube link");
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const { type, value } = detectInputType(input);
      setDetectedType(type);

      let extracted: Metadata;

      switch (type) {
        case "doi":
          extracted = await extractDOI(value);
          break;
        case "isbn":
          extracted = await extractISBN(value);
          break;
        case "youtube":
          extracted = await extractYouTube(value);
          break;
        case "url":
          extracted = await extractURL(value);
          break;
        default:
          if (input.includes(".")) {
            const url = input.startsWith("http") ? input : `https://${input}`;
            extracted = await extractURL(url);
            setDetectedType("url");
          } else {
            throw new Error(
              "Could not determine input type. Enter a valid URL, DOI, ISBN, or YouTube link."
            );
          }
      }

      setMetadata(extracted);
    } catch (err: any) {
      setError(err.message || "Failed to extract citation");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCitation = (): string => {
    if (!metadata || !detectedType) return "";
    return formatCitation(metadata, selectedStyle, detectedType);
  };

  const copyCitation = async () => {
    const citation = getCurrentCitation();
    await Clipboard.setStringAsync(citation);
    Alert.alert("Copied!", "Citation copied to clipboard");
  };

  const shareCitation = async () => {
    try {
      await Share.share({ message: getCurrentCitation() });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const resetForm = () => {
    setInput("");
    setMetadata(null);
    setDetectedType(null);
    setError(null);
  };

  // ---------- RENDER ----------
  const typeInfo = liveType ? getTypeLabel(liveType) : null;

  return (
    <SafeAreaView style={componentStyles.container}>
      <ScrollView
        style={componentStyles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={componentStyles.header}>
          <Text style={componentStyles.title}>Citation Generator</Text>
          <Text style={componentStyles.subtitle}>
            Enter a URL, DOI, ISBN, or YouTube link
          </Text>
        </View>

        {/* Input */}
        <View style={componentStyles.inputSection}>
          <TextInput
            style={componentStyles.urlInput}
            placeholder="https://... or 10.1000/xyz or 978-0-123456-78-9"
            placeholderTextColor={colors.gray1}
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Live Detection Badge */}
          {typeInfo && !metadata && (
            <View style={componentStyles.detectionBadge}>
              <Text style={componentStyles.detectionIcon}>{typeInfo.icon}</Text>
              <Text style={componentStyles.detectionText}>
                {typeInfo.label}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              componentStyles.generateButton,
              loading && componentStyles.buttonDisabled,
            ]}
            onPress={handleExtract}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={componentStyles.generateButtonText}>
                ✨ Extract Citation
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={componentStyles.errorBox}>
            <Text style={componentStyles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Results */}
        {metadata && (
          <>
            {/* Success Badge */}
            <View style={componentStyles.successBadge}>
              <Text style={componentStyles.successText}>
                ✅ Citation extracted!
              </Text>
              {detectedType && (
                <View style={componentStyles.typeBadge}>
                  <Text>
                    {getTypeLabel(detectedType).icon}{" "}
                    {getTypeLabel(detectedType).label}
                  </Text>
                </View>
              )}
            </View>

            {/* Metadata Cards */}
            <View style={componentStyles.metadataGrid}>
              <View style={componentStyles.metadataItem}>
                <Text style={componentStyles.metadataLabel}>📄 Title</Text>
                <Text style={componentStyles.metadataValue} numberOfLines={2}>
                  {metadata.title}
                </Text>
              </View>
              <View style={componentStyles.metadataItem}>
                <Text style={componentStyles.metadataLabel}>👤 Author</Text>
                <Text style={componentStyles.metadataValue}>
                  {metadata.author}
                </Text>
              </View>
              <View style={componentStyles.metadataItem}>
                <Text style={componentStyles.metadataLabel}>📅 Year</Text>
                <Text style={componentStyles.metadataValue}>
                  {metadata.publishYear || "n.d."}
                </Text>
              </View>
              <View style={componentStyles.metadataItem}>
                <Text style={componentStyles.metadataLabel}>🏢 Source</Text>
                <Text style={componentStyles.metadataValue}>
                  {metadata.journal || metadata.siteName}
                </Text>
              </View>
            </View>

            {/* Citation Style Selector */}
            <View style={componentStyles.styleSelector}>
              <Text style={componentStyles.sectionLabel}>Citation Style</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {styles_list.map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      componentStyles.styleChip,
                      selectedStyle === style &&
                        componentStyles.styleChipActive,
                    ]}
                    onPress={() => setSelectedStyle(style)}
                  >
                    <Text
                      style={[
                        componentStyles.styleChipText,
                        selectedStyle === style &&
                          componentStyles.styleChipTextActive,
                      ]}
                    >
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Formatted Citation */}
            <View style={componentStyles.citationCard}>
              <View style={componentStyles.citationHeader}>
                <Text style={componentStyles.citationStyle}>
                  {selectedStyle} Citation
                </Text>
                <View style={componentStyles.citationActions}>
                  <TouchableOpacity
                    style={componentStyles.actionButton}
                    onPress={copyCitation}
                  >
                    <Text style={componentStyles.actionButtonText}>
                      📋 Copy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={componentStyles.actionButton}
                    onPress={shareCitation}
                  >
                    <Text style={componentStyles.actionButtonText}>
                      📤 Share
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={componentStyles.citationText}>
                {getCurrentCitation()}
              </Text>
            </View>

            {/* Extract Another */}
            <TouchableOpacity
              style={componentStyles.resetButton}
              onPress={resetForm}
            >
              <Text style={componentStyles.resetButtonText}>
                🔄 Extract Another
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Tips - shown only when no result */}
        {!metadata && !loading && !error && (
          <View style={componentStyles.tipsSection}>
            <Text style={componentStyles.tipsTitle}>
              💡 What you can enter:
            </Text>
            <Text style={componentStyles.tipText}>
              • DOI: 10.1038/nature12373
            </Text>
            <Text style={componentStyles.tipText}>
              • ISBN: 978-0-321-12521-7
            </Text>
            <Text style={componentStyles.tipText}>
              • YouTube: youtube.com/watch?v=...
            </Text>
            <Text style={componentStyles.tipText}>• Any website URL</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// PART 7: STYLES
// ============================================

const componentStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: { paddingVertical: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: colors.white },
  subtitle: { fontSize: 15, color: colors.gray1, marginTop: 4 },
  inputSection: { marginBottom: 20 },
  urlInput: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.white,
    marginBottom: 12,
  },
  detectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.gray5,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  detectionIcon: { fontSize: 14, marginRight: 6 },
  detectionText: { fontSize: 12, color: colors.gray1 },
  generateButton: {
    backgroundColor: colors.appleBlue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  generateButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#ef4444", fontSize: 14 },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  successText: { color: colors.appleGreen, fontSize: 16, fontWeight: "600" },
  typeBadge: {
    marginLeft: 12,
    backgroundColor: colors.gray5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  metadataItem: {
    width: "48%",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 12,
  },
  metadataLabel: { fontSize: 11, color: colors.gray2, marginBottom: 4 },
  metadataValue: { fontSize: 14, color: colors.white, fontWeight: "500" },
  styleSelector: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, color: colors.gray1, marginBottom: 12 },
  styleChip: {
    backgroundColor: colors.gray5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  styleChipActive: {
    borderColor: colors.appleBlue,
    backgroundColor: colors.gray4,
  },
  styleChipText: { color: colors.gray1, fontSize: 14, fontWeight: "500" },
  styleChipTextActive: { color: colors.appleBlue },
  citationCard: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  citationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  citationStyle: { fontSize: 14, fontWeight: "600", color: colors.appleBlue },
  citationActions: { flexDirection: "row", gap: 8 },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.gray4,
    borderRadius: 8,
  },
  actionButtonText: { color: colors.white, fontSize: 12 },
  citationText: { fontSize: 14, color: colors.white, lineHeight: 22 },
  resetButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 20,
  },
  resetButtonText: { color: colors.appleBlue, fontSize: 14 },
  tipsSection: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 12,
  },
  tipText: { fontSize: 14, color: colors.gray1, marginBottom: 6 },
});
