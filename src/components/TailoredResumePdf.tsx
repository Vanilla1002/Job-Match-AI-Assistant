import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData, PersonalDetails } from '@/lib/AiServices';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#000',
  },
  // --- Header ---
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20, 
  },
  name: {
    fontSize: 24, 
    fontFamily: 'Times-Bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0, 
    fontSize: 9,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 5, 
    color: '#000',
  },
  link: {
    color: '#000',
    textDecoration: 'none',
  },

  // --- Sections ---
  sectionContainer: {
    marginBottom: 12, 
  },
  sectionHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.75, 
    borderBottomColor: '#000',
    marginBottom: 8,
    paddingBottom: 2,
    marginTop: 2,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1, 
  },

  // --- Content Items ---
  contentBlock: {
    marginBottom: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 1,
  },
  titleLeft: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
  },
  // Added specific style for clickable titles
  titleLeftLink: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    color: '#005cc5', // Standard "Link Blue"
    textDecoration: 'none',
  },
  dateRight: {
    fontSize: 9,
    fontFamily: 'Times-Roman',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Times-Italic', 
    marginBottom: 2,
  },
  
  // --- Bullets ---
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2, 
    paddingLeft: 5,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    textAlign: 'center',
  },
  bulletContent: {
    flex: 1,
    fontSize: 10,
  },

  // --- Skills Specific ---
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillCategory: {
    fontFamily: 'Times-Bold',
    width: 110, 
  },
  skillList: {
    flex: 1,
    fontFamily: 'Times-Roman',
  },
});

export const TailoredResumePdf = ({ data }: { data: { personal_details: PersonalDetails, content: ResumeData } }) => {
  const { personal_details, content } = data;

  // Helper function for contact details
  const ContactItem = ({ text, link, isLast }: { text?: string, link?: string, isLast?: boolean }) => {
    if (!text) return null;
    return (
      <View style={styles.contactItem}>
        {link ? <Link src={link} style={styles.link}>{text}</Link> : <Text>{text}</Text>}
        {!isLast && <Text style={styles.separator}>|</Text>} 
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* === HEADER === */}
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{personal_details?.name || 'Candidate Name'}</Text>
          <View style={styles.contactRow}>
            <ContactItem text={personal_details?.phone} />
            <ContactItem text={personal_details?.location} />
            <ContactItem text={personal_details?.email} />
            <ContactItem text="LinkedIn" link={personal_details?.linkedin} />
            <ContactItem text="GitHub" link={personal_details?.github} isLast={true} />
          </View>
        </View>

        {/* === SUMMARY === */}
        {content.summary && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
            </View>
            <Text style={{textAlign: 'justify'}}>{content.summary}</Text>
          </View>
        )}

        {/* === EDUCATION === */}
        {content.education && content.education.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Education</Text>
            </View>
            {content.education.map((edu, i) => (
              <View key={i} style={styles.contentBlock}>
                <View style={styles.rowHeader}>
                  <Text style={styles.titleLeft}>
                    {edu.degree}{edu.institution ? `, ${edu.institution}` : ''}
                  </Text>
                  <Text style={styles.dateRight}>{edu.dates}</Text>
                </View>
                {edu.details && (
                  <Text style={{ fontSize: 9, marginTop: 1, paddingLeft: 2, fontStyle: 'italic' }}>{edu.details}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* === SKILLS === */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills</Text>
          </View>
          {Array.isArray(content.skills) ? (
             <Text>{content.skills.join(', ')}</Text>
          ) : (
            <>
               {content.skills?.languages?.length > 0 && (
                 <View style={styles.skillRow}>
                   <Text style={styles.skillCategory}>Languages:</Text>
                   <Text style={styles.skillList}>{content.skills.languages.join(', ')}</Text>
                 </View>
               )}
               {content.skills?.frameworks?.length > 0 && (
                 <View style={styles.skillRow}>
                   <Text style={styles.skillCategory}>Backend/Frameworks:</Text>
                   <Text style={styles.skillList}>{content.skills.frameworks.join(', ')}</Text>
                 </View>
               )}
               {content.skills?.tools?.length > 0 && (
                 <View style={styles.skillRow}>
                   <Text style={styles.skillCategory}>Dev Tools & Cloud:</Text>
                   <Text style={styles.skillList}>{content.skills.tools.join(', ')}</Text>
                 </View>
               )}
                {content.skills?.other?.length > 0 && (
                 <View style={styles.skillRow}>
                   <Text style={styles.skillCategory}>Other:</Text>
                   <Text style={styles.skillList}>{content.skills.other.join(', ')}</Text>
                 </View>
               )}
            </>
          )}
        </View>

        {/* === PROJECTS === */}
        {content.projects && content.projects.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {content.projects.map((proj, i) => (
              <View key={i} style={styles.contentBlock}>
                <View style={styles.rowHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {/* UPDATED LOGIC: Check if URL exists, if so render Link with blue color */}
                    {proj.url ? (
                        <Link src={proj.url} style={{ textDecoration: 'none' }}>
                             <Text style={styles.titleLeftLink}>{proj.name}</Text>
                        </Link>
                    ) : (
                        <Text style={styles.titleLeft}>{proj.name}</Text>
                    )}
                    
                    {proj.tech_stack && proj.tech_stack.length > 0 && (
                        <Text style={{ fontFamily: 'Times-Italic', fontSize: 9, marginLeft: 5 }}>
                           ({proj.tech_stack.join(', ')})
                        </Text>
                    )}
                  </View>
                </View>
                
                {proj.description && <Text style={{ marginBottom: 2 }}>{proj.description}</Text>}

                {proj.details?.map((desc, j) => (
                   <View key={j} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>{desc}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* === EXPERIENCE === */}
        {content.experience && content.experience.length > 0 && (
          <View style={styles.sectionContainer}>
             <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Experience</Text>
            </View>
            {content.experience.map((job, i) => (
              <View key={i} style={styles.contentBlock}>
                <View style={styles.rowHeader}>
                  <Text style={styles.titleLeft}>{job.role}</Text>
                  <Text style={styles.dateRight}>{job.dates}</Text>
                </View>
                <Text style={styles.subtitle}>{job.company}</Text>
                
                {job.description?.map((desc, j) => (
                  <View key={j} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>{desc}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
};