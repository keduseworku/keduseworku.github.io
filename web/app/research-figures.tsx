'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const figures = {
  macs: {
    src: '/media/macs0647-field.jpg', width: 1206, height: 1991,
    title: 'MACS0647, as observed by JWST',
    alt: 'Original JWST NIRCam view of MACS0647 with galaxy candidates marked by red circles and catalog IDs. Cyan labels identify galaxies with spectroscopic redshifts.',
    caption: 'The labeled NIRCam field from our paper. Cyan labels identify galaxies with spectroscopic redshifts; the original catalog IDs are preserved.',
    credit: 'Worku et al. (2025) · Figure 1, left panel',
    source: 'https://arxiv.org/html/2512.11985v1#S1.F1',
  },
  dawn: {
    src: '/media/cosmic-dawn-21cm.png', width: 1900, height: 620,
    title: 'Magnetic fields and the timing of Cosmic Dawn',
    alt: 'Two original plots show predicted 21-cm brightness temperature in millikelvin and fluctuation power in millikelvin squared versus redshift. Colored curves indicate different primordial magnetic-field amplitudes; a dashed black curve is the zero-field reference.',
    caption: 'At a fixed magnetic spectral index of −2.9, changing the primordial magnetic-field amplitude shifts the timing and amplitude of the predicted signal. The right panel shows power at k = 0.30 Mpc⁻¹.',
    credit: 'Worku, Cruz & Kamionkowski (2026) · Figure 2',
    source: 'https://arxiv.org/html/2605.05323v1#S2.F2',
  },
};

type FigureKey = keyof typeof figures;
function PaperFigure({ name }: { name: FigureKey }) {
  const f = figures[name];
  return <figure className={'paper-figure paper-figure-'+name}>
    <Dialog>
      <DialogTrigger className="figure-trigger" aria-label={'Enlarge figure: '+f.title}>
        <img src={f.src} alt={f.alt} width={f.width} height={f.height} loading="lazy" decoding="async" />
        <span className="enlarge-label">View larger <span aria-hidden="true">↗</span></span>
      </DialogTrigger>
      <DialogContent className="research-dialog">
        <DialogHeader>
          <DialogTitle className="figure-dialog-title">{f.title}</DialogTitle>
          <DialogDescription className="figure-dialog-description">{f.caption}</DialogDescription>
        </DialogHeader>
        <div className="figure-full" role="region" aria-label="Enlarged figure; scroll to inspect" tabIndex={0}><img src={f.src} alt={f.alt} width={f.width} height={f.height} /></div>
        <div className="figure-dialog-footer"><span>{f.credit}</span><a href={f.src} target="_blank" rel="noreferrer">Full resolution ↗</a><a href={f.source} target="_blank" rel="noreferrer">Figure in paper ↗</a></div>
      </DialogContent>
    </Dialog>
    <figcaption><span>{f.credit}</span><a href={f.source} target="_blank" rel="noreferrer">Source figure ↗</a></figcaption>
  </figure>;
}

export default function ResearchFigures() {
  return <section id="research" className="research-section">

    <article id="macs-figure" className="research-feature macs-feature">
      <PaperFigure name="macs" />
      <div className="research-story"><p className="eyebrow">MACS0647 / JWST</p><h3>Finding galaxies<br/>in the distant past.</h3><p>A foreground galaxy cluster magnifies the light of distant galaxies. This is the field we studied with JWST.</p><p>We combined imaging and spectroscopy to build a catalog of distant galaxy candidates and investigate their physical properties. The cyan labels mark objects with spectroscopic redshifts.</p><div className="figure-takeaway"><span>What to look for</span><p>The circles locate the candidates among the foreground objects. The labels connect these points of light to the measurements in the paper.</p></div><a className="text-link" href="https://arxiv.org/abs/2512.11985" target="_blank" rel="noreferrer">Read the MACS0647 paper ↗</a></div>
    </article>
    <article id="cosmic-dawn" className="research-feature dawn-feature">
      <div className="dawn-story"><div><p className="eyebrow">21-CM / COSMIC DAWN</p><h3>A different clock<br/>for the early universe.</h3></div><div><p>Primordial magnetic fields can change when early structure forms. In our models, that leaves a signature in the 21-cm signal from hydrogen.</p><p>Each color below represents a different magnetic-field amplitude. Follow how the troughs and peaks shift relative to the dashed, zero-field reference.</p></div></div>
      <PaperFigure name="dawn" />
      <div className="plot-reading"><p><strong>Left:</strong> the sky-averaged 21-cm brightness temperature.</p><p><strong>Right:</strong> the power in spatial fluctuations of that signal.</p><p><strong>Reading the axis:</strong> higher redshift means an earlier universe.</p></div>
      <a className="text-link" href="https://arxiv.org/abs/2605.05323" target="_blank" rel="noreferrer">Read the Cosmic Dawn paper ↗</a>
    </article>
  </section>;
}
