import { useState, useEffect } from 'react';
import { fetchTopic } from '../services/api';

function transformApiData(type, apiData) {
  const base = {
    title: apiData.title,
    subtitle: apiData.subtitle,
    icon: apiData.icon,
    color: apiData.color,
    conversation: apiData.conversation || [],
  };

  switch (type) {
    case 'prophet':
      return { ...base, quickFacts: (apiData.stories || []).map(s => ({ label: s.title, value: s.summary || s.subtitle || '' })) };
    case 'sahaba':
      return { ...base, companions: (apiData.stories || []).map(s => ({ id: s._id, name: s.title, title: s.subtitle, icon: s.icon || '📖', about: s.content || s.summary || '', highlights: s.highlights || [], quote: s.quote })) };
    case 'ghazwat':
      return { ...base, battles: (apiData.stories || []).map(s => ({ id: s._id, name: s.title, date: s.subtitle || '', icon: s.icon || '⚔️', location: (s.tags || [])[0] || '', result: '', reason: s.content || s.summary || '', highlights: s.highlights || [], quranVerse: s.quote })) };
    case 'ummahat':
      return { ...base, mothers: (apiData.stories || []).map(s => ({ id: s._id, name: s.title, title: s.subtitle, icon: s.icon || '👑', about: s.content || s.summary || '', highlights: s.highlights || [], quote: s.quote })) };
    case 'videos':
      return { ...base, videos: (apiData.videos || []).map(v => ({ id: v._id, title: v.title, url: v.url, description: v.description, duration: v.duration, category: v.category || '' })) };
    default:
      return base;
  }
}

export function useData(type) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const apiData = await fetchTopic(type);
        if (!cancelled && apiData) {
          setData({ fromAPI: true, ...transformApiData(type, apiData) });
          setLoading(false);
          return;
        }
      } catch {}
      try {
        const localData = {
          prophet: require('../../data/prophet.json'),
          sahaba: require('../../data/sahaba.json'),
          ghazwat: require('../../data/ghazwat.json'),
          ummahat: require('../../data/ummahat.json'),
          videos: require('../../data/videos.json'),
        };
        if (!cancelled && localData[type]) {
          setData({ fromAPI: false, ...localData[type] });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load data');
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [type]);

  return { data, loading, error };
}
