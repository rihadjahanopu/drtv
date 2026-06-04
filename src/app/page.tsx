import channelsData from '@/data/channels.json';
import MainLayout from '@/components/MainLayout';
import { Channel } from '@/types';

export default function Home() {
  return (
    <MainLayout initialChannels={channelsData as Channel[]} />
  );
}
