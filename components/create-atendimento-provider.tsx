"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UploadCloudIcon } from "lucide-react"

type CreatePriority = "Low" | "Medium" | "High"

type CreateAtendimentoContextValue = {
  openCreateAtendimento: () => void
}

const CreateAtendimentoContext =
  createContext<CreateAtendimentoContextValue | null>(null)

export function useCreateAtendimento() {
  const ctx = useContext(CreateAtendimentoContext)
  if (!ctx) {
    throw new Error(
      "useCreateAtendimento must be used within CreateAtendimentoProvider",
    )
  }
  return ctx
}

export function CreateAtendimentoProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<CreatePriority>("Medium")
  const [sector, setSector] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const openCreateAtendimento = useCallback(() => setIsOpen(true), [])

  function validateAndAppendFiles(incomingFiles: FileList | File[]) {
    setUploadError(null)
    const selectedFiles = Array.from(incomingFiles ?? [])

    const tooBigImages = selectedFiles.filter(
      (file) => file.type.startsWith("image/") && file.size > 5 * 1024 * 1024,
    )
    const tooBigVideos = selectedFiles.filter(
      (file) => file.type.startsWith("video/") && file.size > 30 * 1024 * 1024,
    )
    const tooBigDocs = selectedFiles.filter(
      (file) =>
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/") &&
        file.size > 10 * 1024 * 1024,
    )

    if (tooBigImages.length || tooBigVideos.length || tooBigDocs.length) {
      toast.error(
        "Alguns arquivos excedem o limite permitido. Fotos até 5MB, vídeos até 30MB e documentos até 10MB.",
      )
      setUploadError(
        "Imagens até 5MB, vídeos até 30MB e documentos até 10MB.",
      )
      return
    }

    setFiles((current) => [...current, ...selectedFiles])
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    validateAndAppendFiles(event.target.files ?? [])
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer?.files?.length) {
      validateAndAppendFiles(event.dataTransfer.files)
    }
  }

  async function handleCreateSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!title.trim()) {
      setUploadError("Informe um título para o atendimento.")
      return
    }

    setIsSubmitting(true)
    setUploadError(null)
    setUploadProgress(0)

    const toastId = toast.loading("Criando atendimento...")

    const totalSteps = 20
    let currentStep = 0

    await new Promise<void>((resolve) => {
      const interval = window.setInterval(() => {
        currentStep += 1
        const percent = Math.min(
          100,
          Math.round((currentStep / totalSteps) * 100),
        )
        setUploadProgress(percent)

        if (currentStep >= totalSteps) {
          window.clearInterval(interval)
          resolve()
        }
      }, 120)
    })

    setIsSubmitting(false)
    setIsOpen(false)
    setTitle("")
    setDescription("")
    setSector("")
    setFiles([])
    setUploadProgress(0)

    toast.success("Atendimento criado com sucesso.", { id: toastId })
  }

  return (
    <CreateAtendimentoContext.Provider value={{ openCreateAtendimento }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="lg">
          <form onSubmit={handleCreateSubmit} className="flex h-full flex-col">
            <DialogHeader>
              <DialogTitle>Criar atendimento</DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <Field>
                <FieldLabel htmlFor="create-title">
                  <FieldTitle>Título</FieldTitle>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="create-title"
                    placeholder="Digite o título do atendimento"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="create-description">
                  <FieldTitle>Descrição</FieldTitle>
                </FieldLabel>
                <FieldContent>
                  <textarea
                    id="create-description"
                    className="min-h-[120px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
                    placeholder="Descreva o atendimento com detalhes"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </FieldContent>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>
                    <FieldTitle>Prioridade</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={priority}
                      onValueChange={(value) =>
                        setPriority(value as CreatePriority)
                      }
                    >
                      <SelectTrigger
                        size="default"
                        className="w-full cursor-pointer"
                      >
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start" side="bottom">
                        <SelectItem value="Low">Baixa</SelectItem>
                        <SelectItem value="Medium">Média</SelectItem>
                        <SelectItem value="High">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    <FieldTitle>Setor responsável</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Select value={sector} onValueChange={(value) => setSector(value)}>
                      <SelectTrigger
                        size="default"
                        className="w-full cursor-pointer"
                      >
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start" side="bottom">
                        <SelectItem value="atendimento">Atendimento</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="suporte">Suporte</SelectItem>
                        <SelectItem value="administrativo">
                          Administrativo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="create-files">
                  <FieldTitle>Anexos</FieldTitle>
                </FieldLabel>
                <FieldContent>
                  <div
                    className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-4 text-xs text-muted-foreground"
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onDrop={handleDrop}
                  >
                    {files.length === 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("create-files")?.click()
                        }
                        className="mx-auto flex cursor-pointer flex-col items-center gap-1.5 text-foreground"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <UploadCloudIcon className="size-5" />
                        </span>
                        <span className="text-sm font-semibold">
                          Pesquisar arquivos
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Arraste e solte os arquivos aqui
                        </span>
                      </button>
                    )}
                    <input
                      id="create-files"
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleFilesChange}
                    />
                    {files.length > 0 && (
                      <div className="mt-2 space-y-2 text-xs text-foreground">
                        <div className="font-medium">
                          {files.length} arquivo(s) selecionado(s)
                        </div>
                        <div className="grid max-h-52 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3">
                          {files.map((file) => {
                            const isImage = file.type.startsWith("image/")
                            const isVideo = file.type.startsWith("video/")

                            if (isImage) {
                              return (
                                <div
                                  key={file.name + file.lastModified}
                                  className="group relative overflow-hidden rounded-md border border-border bg-background"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFiles((current) =>
                                        current.filter(
                                          (f) =>
                                            !(
                                              f.name === file.name &&
                                              f.lastModified === file.lastModified
                                            ),
                                        ),
                                      )
                                    }
                                    className="absolute top-1 right-1 z-10 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    ×
                                  </button>
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-24 w-full object-cover"
                                  />
                                  <div className="truncate px-2 py-1 text-[11px]">
                                    {file.name}
                                  </div>
                                </div>
                              )
                            }

                            if (isVideo) {
                              return (
                                <div
                                  key={file.name + file.lastModified}
                                  className="group relative overflow-hidden rounded-md border border-border bg-background"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFiles((current) =>
                                        current.filter(
                                          (f) =>
                                            !(
                                              f.name === file.name &&
                                              f.lastModified === file.lastModified
                                            ),
                                        ),
                                      )
                                    }
                                    className="absolute top-1 right-1 z-10 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    ×
                                  </button>
                                  <video
                                    src={URL.createObjectURL(file)}
                                    className="h-24 w-full object-cover"
                                    muted
                                  />
                                  <div className="truncate px-2 py-1 text-[11px]">
                                    {file.name}
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <div
                                key={file.name + file.lastModified}
                                className="group flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-[11px]"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFiles((current) =>
                                      current.filter(
                                        (f) =>
                                          !(
                                            f.name === file.name &&
                                            f.lastModified === file.lastModified
                                          ),
                                      ),
                                    )
                                  }
                                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-[10px] text-white"
                                >
                                  ×
                                </button>
                                <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                                  DOC
                                </div>
                                <span className="truncate">{file.name}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {uploadError && (
                      <div className="text-xs font-medium text-destructive">
                        {uploadError}
                      </div>
                    )}
                  </div>
                </FieldContent>
              </Field>

              {isSubmitting && (
                <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex size-4 items-center justify-center">
                      <span className="size-3 animate-spin rounded-full border-2 border-ring border-t-transparent" />
                    </span>
                    <span>Criando atendimento...</span>
                  </div>
                  {files.length > 0 && (
                    <Field>
                      <FieldLabel>
                        <FieldTitle>
                          Progresso de upload
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {uploadProgress}%
                          </span>
                        </FieldTitle>
                      </FieldLabel>
                      <FieldContent>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-[width]"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </FieldContent>
                    </Field>
                  )}
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando..." : "Criar atendimento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CreateAtendimentoContext.Provider>
  )
}
