---
layout: page
title: Research
permalink: /projects/
description: Current and past cosmology work
nav: true
nav_order: 3
display_categories: [Ongoing, Past]
horizontal: false
---

<!-- pages/projects.md -->
<div class="projects">
{% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category">{{ category }}</h2>
  </a>
  {% assign categorized_projects = site.projects | where: "category", category %}
  {% assign sorted_projects = categorized_projects | sort: "importance" %}
  <!-- Generate cards for each project -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
  {% endfor %}

{% else %}

<!-- Display projects without categories -->

{% assign sorted_projects = site.projects | sort: "importance" %}

  <!-- Generate cards for each project -->

{% if page.horizontal %}

  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>

<!-- Image Credits Section -->
<div class="image-credits" style="margin-top: 20px;">
  <h4 style="font-size: 1em; margin-bottom: 5px;">Image Credits</h4> <!-- Increased font size -->
  <p style="font-size: 0.8em; margin-top: 0; margin-bottom: 5px;">JWST lensing map: <a href="https://ui.adsabs.harvard.edu/abs/2023ApJ...944L...6M/abstract">Meena et al. 2023</a></p>
  <p style="font-size: 0.8em; margin-top: 0; margin-bottom: 5px;">ACT Y-map: <a href="https://inspirehep.net/literature/2674592">Coulton et al. 2023</a></p>
  <p style="font-size: 0.8em; margin-top: 0; margin-bottom: 5px;">ISW effect: <a href="https://briankoberlein.com/blog/stoking-the-fire">Szapudi</a></p>
</div>



