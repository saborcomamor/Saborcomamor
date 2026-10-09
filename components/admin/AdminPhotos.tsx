"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Album = { id: string; title: string; is_published: boolean };
type PhotoRow = { id: string; alt_text: string; is_published: boolean; published_storage_path: string | null };
type QueueStatus = "ready" | "uploading" | "done" | "error";
type QueuedPhoto = { id: string; file: File; preview: string; alt: string; caption: string; status: QueueStatus; error?: string };
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 15 * 1024 * 1024;
const MAX_BATCH = 30;

async function optimisePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível preparar a imagem.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const webp = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!webp || webp.type !== "image/webp") throw new Error("Este aparelho não conseguiu converter a foto para WebP.");
    if (webp.size > 3 * 1024 * 1024) throw new Error("A versão otimizada ficou acima de 3 MB.");
    return webp;
  } finally { bitmap.close(); }
}

async function sha256(blob: Blob) {
  const bytes = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function defaultDescription(album: string, position: number) {
  return ("Fotografia do acervo " + album + ", imagem " + position).slice(0, 250);
}

export function AdminPhotos() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [items, setItems] = useState<PhotoRow[]>([]);
  const [albumId, setAlbumId] = useState("");
  const [queue, setQueue] = useState<QueuedPhoto[]>([]);
  const [proof, setProof] = useState("");
  const [confirmedRights, setConfirmedRights] = useState(false);
  const [publish, setPublish] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const previews = useRef(new Set<string>());
  const selectedAlbum = albums.find(a => a.id === albumId);
  const toUpload = queue.filter(item => item.status !== "done");
  useEffect(() => () => { previews.current.forEach(url => URL.revokeObjectURL(url)); }, []);

  async function load() {
    const client = getSupabaseBrowser();
    if (!client) return;
    const [ar, pr] = await Promise.all([
      client.from("albums").select("id,title,is_published").order("created_at", { ascending: false }),
      client.from("photos").select("id,alt_text,is_published,published_storage_path").order("created_at", { ascending: false }),
    ]);
    if (ar.error || pr.error) { setMessage("Não foi possível atualizar a lista de fotografias."); return; }
    setAlbums((ar.data ?? []) as Album[]);
    setItems((pr.data ?? []) as PhotoRow[]);
  }
  useEffect(() => { void load(); }, []);

  function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    const invalid = incoming.filter(file => !ALLOWED.includes(file.type) || file.size > MAX_SIZE);
    const valid = incoming.filter(file => ALLOWED.includes(file.type) && file.size <= MAX_SIZE);
    const existing = new Set(queue.map(item => [item.file.name, item.file.size, item.file.lastModified].join("/")));
    const unique = valid.filter(file => !existing.has([file.name, file.size, file.lastModified].join("/")));
    const room = Math.max(0, MAX_BATCH - queue.length);
    const accepted = unique.slice(0, room);
    const albumName = selectedAlbum?.title ?? "Sabor com Amor";
    const added = accepted.map((file, index) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { id: crypto.randomUUID(), file, preview, alt: defaultDescription(albumName, queue.length + index + 1), caption: "", status: "ready" as const };
    });
    setQueue(previous => [...previous, ...added]);
    const alerts = [];
    if (invalid.length) alerts.push(invalid.length + " arquivo(s) ignorado(s): use JPG, PNG, WebP ou AVIF de até 15 MB.");
    if (unique.length > room) alerts.push("Limite de " + MAX_BATCH + " fotografias por envio. Envie as próximas em outro lote.");
    if (unique.length !== valid.length) alerts.push("Fotografias repetidas não foram adicionadas duas vezes.");
    setMessage(alerts.length ? alerts.join(" ") : added.length + " fotografia(s) pronta(s) para envio.");
  }

  function changePhoto(id: string, field: "alt" | "caption", value: string) {
    setQueue(previous => previous.map(item => item.id === id ? { ...item, [field]: value } : item));
  }
  function removePhoto(id: string) {
    const item = queue.find(photo => photo.id === id);
    if (item) { URL.revokeObjectURL(item.preview); previews.current.delete(item.preview); }
    setQueue(previous => previous.filter(photo => photo.id !== id));
  }
  function clearQueue() {
    queue.forEach(item => { URL.revokeObjectURL(item.preview); previews.current.delete(item.preview); });
    setQueue([]);
    setProgress({ done: 0, total: 0 });
    setMessage("");
  }
  function updateStatus(id: string, status: QueueStatus, error?: string) {
    setQueue(previous => previous.map(item => item.id === id ? { ...item, status, error } : item));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const client = getSupabaseBrowser();
    if (!client || !toUpload.length || pending) return;
    if (proof.trim().length < 3 || !confirmedRights) {
      setMessage("Informe onde está registrada a autorização e confirme que ela cobre todas as fotos deste envio.");
      return;
    }
    if (toUpload.some(item => item.alt.trim().length < 3)) {
      setMessage("Confira as descrições das fotografias antes de enviar.");
      return;
    }
    setPending(true);
    setMessage("");
    setProgress({ done: 0, total: toUpload.length });
    let completed = 0;
    let failed = 0;
    for (const item of toUpload) {
      updateStatus(item.id, "uploading");
      try {
        const optimised = await optimisePhoto(item.file);
        const hash = await sha256(optimised);
        const id = crypto.randomUUID();
        const publicPath = id + ".webp";
        const extension = item.file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const originalPath = id + "/original." + extension;
        const created = await client.from("photos").insert({
          id, album_id: albumId || null, published_storage_path: publicPath,
          asset_sha256: hash, alt_text: item.alt.trim(), caption: item.caption.trim(),
          is_published: false,
        });
        if (created.error) throw new Error("Não foi possível criar o registro.");
        const original = await client.storage.from("sabor-originais").upload(originalPath, item.file, { contentType: item.file.type, upsert: false });
        if (original.error) throw new Error("Não foi possível guardar o original; o registro ficou em rascunho.");
        const linked = await client.rpc("register_photo_original", { p_photo_id: id, p_storage_path: originalPath });
        if (linked.error) throw new Error("O original foi enviado, mas faltou vinculá-lo ao registro.");
        const approved = await client.rpc("approve_photo_rights", { p_photo_id: id, p_evidence_reference: proof.trim() });
        if (approved.error) throw new Error("Não foi possível registrar a autorização.");
        const copy = await client.storage.from("sabor-publicadas").upload(publicPath, optimised, { contentType: "image/webp", upsert: false });
        if (copy.error) throw new Error("Não foi possível enviar a versão otimizada.");
        if (publish) {
          const activated = await client.from("photos").update({ is_published: true }).eq("id", id);
          if (activated.error) throw new Error("Arquivo enviado, mas ficou em rascunho.");
        }
        completed += 1;
        updateStatus(item.id, "done");
      } catch (error) {
        failed += 1;
        updateStatus(item.id, "error", error instanceof Error ? error.message : "Falha no envio.");
      }
      setProgress(previous => ({ ...previous, done: previous.done + 1 }));
    }
    setMessage(completed + " fotografia(s) enviada(s)." + (failed ? " " + failed + " com problema: confira os cartões e tente novamente." : "") + (publish && selectedAlbum && !selectedAlbum.is_published ? " O álbum está em rascunho; publique-o em Álbuns para aparecer na galeria." : ""));
    setPending(false);
    await load();
  }

  async function unpublish(item: PhotoRow) {
    const client = getSupabaseBrowser();
    if (!client) return;
    const { error } = await client.from("photos").update({ is_published: false }).eq("id", item.id);
    setMessage(error ? "Não foi possível retirar a fotografia do ar." : "Fotografia retirada da galeria.");
    if (!error) await load();
  }

  return <section className="admin-panel admin-photos" aria-labelledby="photos-title">
    <p className="eyebrow">SEU ACERVO</p>
    <h2 id="photos-title">Adicionar fotografias</h2>
    <p>Envie as fotos de um evento inteiro de uma vez, sem preencher os mesmos dados repetidamente.</p>
    <div className="admin-help" aria-label="Como organizar">
      <strong>Como funciona?</strong>
      <p><b>Álbum</b> é uma pasta, como “Casamento da Ana”. <b>Categoria</b> é escolhida quando você cria o álbum (Pratos, Eventos, Buffets ou Bastidores). Aqui, basta escolher a pasta e selecionar as fotos.</p>
      <p><b>Descrição</b> ajuda pessoas que usam leitores de tela. <b>Legenda</b> é opcional. <b>Autorização</b> é o registro que permite publicar essas imagens.</p>
    </div>
    <form className="admin-form admin-upload-form" onSubmit={submit}>
      <div className="admin-step-heading"><span>1</span><div><h3>Onde guardar as fotos?</h3><p>Escolha o álbum uma única vez para todo o lote.</p></div></div>
      <label>Álbum de destino
        <select value={albumId} onChange={e => setAlbumId(e.target.value)} disabled={pending}>
          <option value="">Galeria geral (sem álbum)</option>
          {albums.map(album => <option key={album.id} value={album.id}>{album.title}{album.is_published ? "" : " · rascunho"}</option>)}
        </select>
      </label>
      <p className="admin-field-hint">Não encontrou o evento? Abra a aba <b>Álbuns</b>, crie a pasta e volte para Fotografias. Sem álbum, as fotos aparecem na categoria Buffets quando publicadas.</p>
      {selectedAlbum && !selectedAlbum.is_published && <p className="admin-hint-warning">Esse álbum está em rascunho. Para mostrar as fotos no site, publique também o álbum na aba Álbuns.</p>}
      <div className="admin-step-heading"><span>2</span><div><h3>Selecione várias fotografias</h3><p>Até 30 por envio. Toque no botão e marque quantas quiser na galeria do celular.</p></div></div>
      <label className="admin-file-picker" htmlFor="admin-photo-files">
        <span className="admin-file-picker-title">+ Escolher fotografias</span>
        <span>JPG, PNG, WebP ou AVIF · até 15 MB cada</span>
        <input id="admin-photo-files" type="file" multiple accept={ALLOWED.join(",")} disabled={pending}
          onChange={e => { addPhotos(e.target.files); e.target.value = ""; }}/>
      </label>
      {queue.length > 0 && <>
        <div className="admin-queue-heading">
          <strong>{queue.length} fotografias selecionadas</strong>
          <button type="button" onClick={clearQueue} disabled={pending} className="admin-subtle-button">Limpar seleção</button>
        </div>
        <p className="admin-field-hint">A descrição vem preenchida para agilizar. Você pode alterá-la em cada foto; a legenda não é obrigatória.</p>
        <div className="admin-photo-queue">
          {queue.map((item, index) => <article className="admin-photo-item" key={item.id}>
            <img className="admin-photo-thumb" src={item.preview} alt={"Prévia " + (index + 1)} loading="lazy"/>
            <div className="admin-photo-fields">
              <div className="admin-photo-item-title"><strong>{item.file.name}</strong><span>{(item.file.size / 1024 / 1024).toFixed(1)} MB</span></div>
              <label>Descrição da foto<input value={item.alt} maxLength={250} minLength={3} required disabled={pending || item.status === "done"} onChange={e => changePhoto(item.id, "alt", e.target.value)}/></label>
              <label>Legenda (opcional)<input value={item.caption} maxLength={180} disabled={pending || item.status === "done"} onChange={e => changePhoto(item.id, "caption", e.target.value)} placeholder="Ex.: Um dia cheio de amor"/></label>
              <div className="admin-photo-item-footer"><small role="status">{item.status === "ready" ? "Pronta" : item.status === "uploading" ? "Enviando…" : item.status === "done" ? "✓ Enviada" : "Erro: " + (item.error ?? "")}</small>
                {item.status !== "done" && <button className="admin-subtle-button" type="button" disabled={pending} onClick={() => removePhoto(item.id)}>Remover</button>}
              </div>
            </div>
          </article>)}
        </div>
      </>}
      <div className="admin-step-heading"><span>3</span><div><h3>Autorização e publicação</h3><p>Uma referência pode valer para todas as fotos, desde que o documento realmente cubra todas elas.</p></div></div>
      <label>Onde está registrada a autorização?
        <input required minLength={3} maxLength={400} value={proof} disabled={pending} onChange={e => setProof(e.target.value)}
          placeholder="Ex.: autorização dos responsáveis, contrato nº 12"/>
      </label>
      <label className="admin-check"><input type="checkbox" required checked={confirmedRights} disabled={pending} onChange={e => setConfirmedRights(e.target.checked)}/> Confirmo que tenho autorização para usar todas as fotografias selecionadas, inclusive imagens de pessoas e menores.</label>
      <label className="admin-check"><input type="checkbox" checked={publish} disabled={pending} onChange={e => setPublish(e.target.checked)}/> Mostrar no site após o envio <small>(se desmarcado, ficam em rascunho)</small></label>
      {pending && <div className="admin-batch-progress" role="status" aria-live="polite">Enviando {progress.done} de {progress.total} fotografias. Mantenha esta página aberta.<progress max={progress.total || 1} value={progress.done}/></div>}
      <button type="submit" disabled={pending || toUpload.length === 0}>{pending ? "Enviando fotografias…" : toUpload.length ? "Enviar " + toUpload.length + " fotografias" : "Selecione as fotos para começar"}</button>
    </form>
    {message && <p className="admin-upload-feedback" role="status" aria-live="polite">{message}</p>}
    <div className="admin-uploaded-list"><h3>Fotografias cadastradas</h3>
      <ul className="admin-list">{items.map(item => <li key={item.id}><div><strong>{item.alt_text}</strong><small>{item.is_published ? "Publicada" : "Rascunho"}</small></div>{item.is_published && <button type="button" onClick={() => unpublish(item)}>Retirar do ar</button>}</li>)}</ul>
    </div>
  </section>;
}
