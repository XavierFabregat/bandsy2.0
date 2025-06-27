"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { Loader2, Upload, FileAudio, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

interface FileWithMetadata {
  file: File;
  title: string;
  description: string;
  instrumentId: string;
  genreIds: string[];
  duration: number | null;
  size: number;
}

interface Instrument {
  id: string;
  name: string;
  category: string;
}

interface Genre {
  id: string;
  name: string;
}

export default function SampleUploadZone() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithMetadata | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch instruments and genres on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instrumentsResponse, genresResponse] = await Promise.all([
          fetch("/api/instruments"),
          fetch("/api/genres"),
        ]);

        if (instrumentsResponse.ok) {
          const instrumentsData =
            (await instrumentsResponse.json()) as Instrument[];
          setInstruments(instrumentsData);
        }

        if (genresResponse.ok) {
          const genresData = (await genresResponse.json()) as Genre[];
          setGenres(genresData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    void fetchData();
  }, []);

  const { startUpload } = useUploadThing("sampleUploader", {
    onClientUploadComplete: async (data) => {
      try {
        console.log("Upload complete data:", data);

        if (data.length > 0 && selectedFile) {
          const fileData = data[0]!;
          const { sampleId, uploadedBy } = fileData.serverData;

          if (sampleId && uploadedBy) {
            await fetch("/api/sample/update", {
              method: "POST",
              body: JSON.stringify({
                sampleId,
                metadata: {
                  title: selectedFile.title,
                  description: selectedFile.description,
                  instrumentId: selectedFile.instrumentId,
                  genreIds: selectedFile.genreIds,
                  duration: selectedFile.duration,
                  fileType: "audio",
                },
              }),
            });

            router.refresh();
            setSelectedFile(null);
            setIsUploading(false);
          }
        }
      } catch (error) {
        console.error("Error updating sample:", error);
        setIsUploading(false);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsDragOver(false);
      setIsUploading(false);
    },
  });

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener("loadedmetadata", () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(audio.duration));
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load audio file"));
      });

      audio.src = url;
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("audio/"),
    );

    if (fileArray.length === 0) {
      alert("Please select an audio file (MP3, WAV, M4A, AAC, or FLAC)");
      return;
    }

    if (fileArray.length > 0) {
      const file = fileArray[0]!;
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      try {
        const duration = await getAudioDuration(file);

        setSelectedFile({
          file,
          title: fileName,
          description: "",
          instrumentId: "",
          genreIds: [],
          duration,
          size: file.size,
        });
      } catch (error) {
        console.error("Error getting duration:", error);
        setSelectedFile({
          file,
          title: fileName,
          description: "",
          instrumentId: "",
          genreIds: [],
          duration: null,
          size: file.size,
        });
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        await handleFiles(target.files);
      }
    };
    input.click();
  }, [handleFiles]);

  const updateMetadata = (updates: Partial<FileWithMetadata>) => {
    setSelectedFile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    // Validation
    if (!selectedFile.title.trim()) {
      alert("Please enter a title for your sample");
      return;
    }

    setIsUploading(true);
    await startUpload([selectedFile.file]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Group instruments by category
  const instrumentsByCategory = instruments.reduce(
    (acc, instrument) => {
      acc[instrument.category] ??= [];
      acc[instrument.category]!.push(instrument);
      return acc;
    },
    {} as Record<string, Instrument[]>,
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Upload Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-all duration-200 ease-in-out ${
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        } ${isUploading ? "pointer-events-none opacity-50" : ""} `}
      >
        {/* Background Pattern */}
        <div className="to-muted/20 absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-transparent" />

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          <div
            className={`rounded-full p-4 transition-all duration-200 ${
              isDragOver
                ? "bg-primary/10 scale-110"
                : "bg-muted group-hover:bg-primary/5"
            } `}
          >
            {isUploading ? (
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            ) : (
              <Upload className="text-muted-foreground group-hover:text-primary h-8 w-8 transition-colors" />
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-2 text-center">
            <h3 className="text-foreground text-lg font-semibold">
              {isDragOver
                ? "Drop your audio file here"
                : "Upload your audio sample"}
            </h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop an audio file, or{" "}
              <span className="text-primary font-medium underline underline-offset-2">
                browse
              </span>
            </p>
          </div>

          {/* File Type Icon */}
          <div className="text-muted-foreground/60 flex items-center gap-1 text-xs">
            <FileAudio className="h-4 w-4" />
            <span>Audio files only</span>
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="bg-primary/5 border-primary/50 absolute inset-0 rounded-lg border-2" />
        )}
      </div>

      {/* File Requirements */}
      <div className="mt-4 text-center">
        <p className="text-muted-foreground text-xs">
          Supports MP3, WAV, FLAC, AAC • Max 16MB per file
        </p>
      </div>

      {/* Selected File with Metadata Form */}
      {selectedFile && (
        <div className="mt-6 space-y-6">
          <h3 className="text-lg font-semibold">Add details to your sample:</h3>

          <div className="bg-muted space-y-6 rounded-lg border p-6">
            {/* File Info Header */}
            <div className="flex items-start gap-4 border-b pb-4">
              <div className="flex-shrink-0">
                <FileAudio className="h-8 w-8 text-blue-500" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium">
                  {selectedFile.file.name}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {formatFileSize(selectedFile.file.size)} •{" "}
                  {selectedFile.file.type}
                </p>
                {selectedFile.duration && (
                  <div className="mt-1 flex items-center gap-1">
                    <Clock className="text-muted-foreground h-3 w-3" />
                    <span className="text-muted-foreground text-xs">
                      {formatDuration(selectedFile.duration)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title Input */}
            <div>
              <label className="mb-2 block text-sm font-medium">Title *</label>
              <input
                type="text"
                value={selectedFile.title}
                onChange={(e) => updateMetadata({ title: e.target.value })}
                placeholder="Enter a title for your sample..."
                className="focus:ring-primary/20 w-full rounded-md border p-2 focus:ring-2 focus:outline-none"
                maxLength={100}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {selectedFile.title.length}/100 characters
              </p>
            </div>

            {/* Description Input */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={selectedFile.description}
                onChange={(e) =>
                  updateMetadata({ description: e.target.value })
                }
                placeholder="Describe this sample (optional)..."
                className="focus:ring-primary/20 w-full resize-none rounded-md border p-2 focus:ring-2 focus:outline-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {selectedFile.description.length}/500 characters
              </p>
            </div>

            {/* Instrument Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Instrument
              </label>
              {isLoadingData ? (
                <div className="bg-muted w-full rounded-md border p-2">
                  <div className="bg-muted-foreground/20 h-4 animate-pulse rounded" />
                </div>
              ) : (
                <select
                  value={selectedFile.instrumentId}
                  onChange={(e) =>
                    updateMetadata({ instrumentId: e.target.value })
                  }
                  className="focus:ring-primary/20 w-full rounded-md border p-2 focus:ring-2 focus:outline-none"
                >
                  <option value="">Select an instrument (optional)</option>
                  {Object.entries(instrumentsByCategory).map(
                    ([category, categoryInstruments]) => (
                      <optgroup key={category} label={category}>
                        {categoryInstruments.map((instrument) => (
                          <option key={instrument.id} value={instrument.id}>
                            {instrument.name}
                          </option>
                        ))}
                      </optgroup>
                    ),
                  )}
                </select>
              )}
            </div>

            {/* Genres Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Genres</label>
              {isLoadingData ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="bg-muted-foreground/20 h-4 w-4 animate-pulse rounded" />
                      <div className="bg-muted-foreground/20 h-4 w-16 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {genres.map((genre) => (
                    <label
                      key={genre.id}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFile.genreIds.includes(genre.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateMetadata({
                              genreIds: [...selectedFile.genreIds, genre.id],
                            });
                          } else {
                            updateMetadata({
                              genreIds: selectedFile.genreIds.filter(
                                (id) => id !== genre.id,
                              ),
                            });
                          }
                        }}
                        className="text-primary focus:ring-primary rounded border-gray-300"
                      />
                      <span className="text-sm">{genre.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={
                isUploading || !selectedFile.title.trim() || isLoadingData
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Sample"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
