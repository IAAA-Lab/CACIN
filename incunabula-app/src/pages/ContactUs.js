import React from 'react';
import i18 from '../i18n/i18';
import '../App.css'; // Assuming you'll add styles in your App.css or a dedicated CSS file

function ContactUs() {
  return (
    <div className="contact-us-container">
      <h1 className="contact-us-title">{i18.t('contactUs.title')}</h1>

      <div className="contact-us-content">
        {/* Paragraph 1 */}
        <p className="contact-us-paragraph">{i18.t('contactUs.welcome')}</p>

      {/* Paragraph 3 */}
        <p className="contact-us-paragraph">
          {i18.t('contactUs.email')}{' '}
          <a href="mailto:pedraza@unizar.es" className="contact-us-link">
            {i18.t('contactUs.emailLink')}
          </a>{' '}
          {i18.t('contactUs.emailText')}
            <a href="mailto:jnog@unizar.es"  className="contact-us-link">
            {i18.t('contactUs.emailLink2')}
          </a>{' .'}  
        </p>
        
        
        
       
     <p className="contact-us-paragraph contact-us-reference">
         
          <a href="https://youtu.be/v49EJ7qHKJ4?si=3QF0zzW1TZ758qRa" className="contact-us-link">
            {i18.t('contactUs.media')}
          </a>
        </p>
        
        <p className="contact-us-paragraph contact-us-reference">
         
          <a href="https://github.com/IAAA-Lab/CACIN" className="contact-us-link">
            {i18.t('contactUs.repoText')}
          </a>
        </p>
        




     {/* referencia */}
<p className="contact-us-paragraph contact-us-reference">
  {i18.t('contactUs.reference')}{' '}


</p>
        {/* frase */}
        <p className="contact-us-paragraph">{i18.t('contactUs.referenceText')}
        
        {/*link */}
          <a href="https://link.springer.com/article/10.1007/s11042-022-13108-3" className="contact-us-link">
            {i18.t('contactUs.referenceLink')}
          </a> 
           {i18.t('contactUs.referenceText2')}
          
        </p>
 
  

      </div>
    </div>
  );
}

export default ContactUs;
