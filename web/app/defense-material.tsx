'use client';
import { useState } from 'react';

const trajectories = [
  { name: 'A single trajectory', file: 'neutrino-single', description: 'One choice of starting angle and speed, shown at three radial positions. Watch how the path bends as the dark-matter halo grows.' },
  { name: 'Many trajectories', file: 'neutrino-ensemble', description: 'A range of angles and speeds at the same three radial positions. The individual paths build up the neutrino distribution around the halo.' },
];
export function NeutrinoMovies() {
  const [selected, setSelected] = useState(0);
  const movie = trajectories[selected];
  return <div className="defense-movies">
    <div className="material-heading"><p className="eyebrow">INSIDE THE CALCULATION</p><h3>Start with a path.<br/>Then put the paths together.</h3></div>
    <div className="material-options" role="group" aria-label="Choose a neutrino animation">{trajectories.map((item, index) => <button key={item.file} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.name}</button>)}</div>
    <figure><video key={movie.file} controls playsInline preload="none" poster={'/media/'+movie.file+'.jpg'} aria-label={movie.name+' around a spherical dark-matter halo'} aria-describedby="trajectory-description"><source src={'/media/'+movie.file+'.mp4'} type="video/mp4"/>Your browser does not support embedded video. <a href={'/media/'+movie.file+'.mp4'}>Open the animation</a>.</video><figcaption id="trajectory-description">{movie.description}</figcaption></figure>
    <p className="simulation-parameters">Halo mass: 10¹⁵ solar masses · Neutrino mass: 0.3 eV</p>
    <p className="material-source">From my PhD defense · Numerical trajectories calculated with Cheetah</p>
  </div>;
}

const stages = [
  ['Small-scale structure', 'Magnetic fields add power on small scales.', 'We start by including primordial magnetic fields in the matter power spectrum. That changes the initial conditions for structure formation.'],
  ['The first stars', 'Change the halos, change when stars form.', 'More small-scale structure changes the population of low-mass halos. Those halos host the first stars, whose radiation affects the surrounding hydrogen.'],
  ['Hydrogen', 'The gas responds to that radiation.', 'As radiation backgrounds build up, the temperature and ionization state of hydrogen change. The 21-cm signal carries information about that history.'],
  ['The signal', 'Look for a shift in timing.', 'We use Zeus21 to follow these changes through to the sky-averaged 21-cm signal and its spatial fluctuations. The curves below show how the prediction changes with magnetic-field strength.'],
];
export function CosmicDawnSteps() {
  const [selected, setSelected] = useState(0);
  return <div className="dawn-sequence"><p className="eyebrow">HOW A MAGNETIC FIELD REACHES THE 21-CM SIGNAL</p><div className="material-options" role="group" aria-label="Explore the Cosmic Dawn calculation">{stages.map((stage,index) => <button key={stage[0]} aria-pressed={selected===index} type="button" onClick={()=>setSelected(index)}><span>0{index+1}</span>{stage[0]}</button>)}</div><div className="sequence-detail" aria-live="polite"><h4>{stages[selected][1]}</h4><p>{stages[selected][2]}</p></div></div>;
}
