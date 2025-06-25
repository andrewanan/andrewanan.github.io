---
layout: post
title: Writings
permalink: /writings/
---

<ul class="list-unstyled">
{% for post in site.posts %}
  <li class="mb-2">
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span class="text-muted">– {{ post.date | date: "%b %d %Y" }}</span>
  </li>
{% endfor %}
</ul>
