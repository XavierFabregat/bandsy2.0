import { Plus, Music, Upload } from "lucide-react";
import SampleUploadZone from "../../_components/sampleUploadZone";

export default function UploadPage() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Music className="text-primary h-8 w-8" />
          </div>
          <h1 className="from-foreground to-foreground/70 mb-2 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Upload Your Sample
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Share your musical talent with the Bandsy community. Upload
            high-quality audio samples to showcase your skills.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mx-auto max-w-4xl">
          <div className="bg-card/50 relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-sm">
            {/* Background Pattern */}
            <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

            {/* Content */}
            <div className="relative p-8">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Plus className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Add New Sample</h2>
                    <p className="text-muted-foreground text-sm">
                      Upload and configure your audio sample
                    </p>
                  </div>
                </div>

                {/* Upload Stats */}
                <div className="hidden items-center gap-4 text-sm md:flex">
                  <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-1">
                    <Upload className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Max 16MB</span>
                  </div>
                  <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-1">
                    <Music className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Audio Only</span>
                  </div>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="border-muted-foreground/20 bg-muted/30 rounded-xl border-2 border-dashed p-8">
                <SampleUploadZone />
              </div>

              {/* Tips Section */}
              <div className="bg-muted/50 mt-8 rounded-xl p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <div className="bg-primary h-2 w-2 rounded-full" />
                  Tips for Great Samples
                </h3>
                <div className="text-muted-foreground grid gap-3 text-sm md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-muted-foreground/40 mt-1 h-1.5 w-1.5 rounded-full" />
                    <span>
                      Keep samples under 2 minutes for best engagement
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-muted-foreground/40 mt-1 h-1.5 w-1.5 rounded-full" />
                    <span>Showcase your best playing and unique style</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-muted-foreground/40 mt-1 h-1.5 w-1.5 rounded-full" />
                    <span>Include different genres to show versatility</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-muted-foreground/40 mt-1 h-1.5 w-1.5 rounded-full" />
                    <span>
                      Make sure audio quality is clear and well-recorded
                    </span>
                  </div>
                </div>
              </div>

              {/* Supported Formats */}
              <div className="bg-background/50 mt-6 rounded-lg p-4">
                <h4 className="mb-2 text-sm font-medium">Supported Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {["MP3", "WAV", "FLAC", "AAC", "M4A"].map((format) => (
                    <span
                      key={format}
                      className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs font-medium"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Your samples will be visible to other musicians on Bandsy. Make
              sure you have the rights to share any music you upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
