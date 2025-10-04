import { Paper } from '@/shared/ui/wrapper';
import { AboutDaoDao, Vision, Mission, ContactUs } from '@/widgets/about';

export default async function AboutPage() {
  return (
    <div className="px-4 pt-20">
      <Paper className="container my-12 max-w-5xl rounded py-8 shadow-lg">
        <AboutDaoDao />
        <Vision />
        <Mission />
        <ContactUs />
      </Paper>
    </div>
  );
}
