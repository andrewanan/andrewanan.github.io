---
layout: post
title: Writings
permalink: /writings/
---
<script src='/js/theme.js'></script>
<ul class="list-unstyled">
{% for post in site.posts %}
  <li class="mb-2">
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span>– {{ post.date | date: "%b %d %Y" }}</span>
  </li>
{% endfor %}
</ul>
