import React from 'react';
import { Paper } from '@/components/ui/paper';
import AboutUs from './AboutUs';
import RealizeMore from './RealizeMore';
import RelatedReport from './RelatedReport';
import AboutTeam from './AboutTeam';
import AwardInfo from './AwardInfo';
import Thanks from './Thanks';
import NeedYou from './NeedYou';
import ContactUs from './ContactUs';
import TechStack from './TechStack';
import Cooperate from './Cooperate';

const About = () => (
  <div className="pt-10 pb-10">
    <Paper className="w-[90%] mx-auto p-5 max-md:p-2.5">
      <AboutUs />
      <RealizeMore />
      <RelatedReport />
      <AwardInfo />
      <AboutTeam />
      <TechStack />
      <NeedYou />
      <Cooperate />
      <Thanks />
      <ContactUs />
    </Paper>
  </div>
);

export default About;
