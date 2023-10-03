const dotenv = require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_KEY });

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const retrievePageProperties = async (databaseId) => {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results.map((page) => ({
    id: page.id,
    pageTitle: page.properties["Name"]?.title[0]?.plain_text || "",
    pageDescription: page.properties["Description"]?.rich_text[0]?.plain_text || "",
    icon: page.icon?.emoji || "",
    creationDate: page.created_time,
    Tags: page.properties["Tags"]?.select.name || "",
  }));
};

const main = async () => {
  try {
    const pageProperties = await retrievePageProperties(DATABASE_ID);
    return pageProperties;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

module.exports = main;
