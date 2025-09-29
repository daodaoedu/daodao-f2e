import { Paper } from '@/components/ui/wrapper';
import { AboutDaoDao, Vision, Mission, ContactUs } from '@/widgets/about';

export default async function AboutPage() {
  return (
    <div className="px-4">
      <Paper className="container my-12 max-w-5xl rounded py-8 shadow-lg">
        <AboutDaoDao />
        <Vision />
        <Mission />
        <ContactUs />
      </Paper>
    </div>
  );
}
